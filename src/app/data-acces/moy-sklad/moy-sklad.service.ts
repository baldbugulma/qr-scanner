import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, forkJoin, map, Observable, of, switchMap, throwError} from 'rxjs';

interface Product {
  id: string;
  name: string;
  quantity: number;
  trackingCodes: TrackingCode[];
  gtin: string;
}

interface TrackingCode {
  cis: string;
  type: string;
}


@Injectable({
  providedIn: 'root'
})
export class MoySkladService {
  http = inject(HttpClient)

  private readonly apiUrl = '/api/moysklad/entity/demand'; // Используем прокси
  private readonly productUrl = '/api/moysklad/entity/product';

  constructor() {}

  getDemandPositions(demandId: string): Observable<any[]> {
    return this.http
      .get<{ rows: any[] }>(`${this.apiUrl}/${demandId}/positions`)
      .pipe(
        switchMap((response) => {
          const positions = response.rows;

          // Получаем ID всех товаров
          const productIds = positions
            .filter((row) => row.assortment?.meta?.type === 'product')
            .map((row) => {
              const match = row.assortment.meta.href.match(/\/product\/([a-zA-Z0-9-]+)/);
              return match ? match[1] : null;
            })
            .filter((id) => id !== null);

          if (productIds.length === 0) {
            return of(positions.map((row) => this.mapPosition(row, {})));
          }

          // Получаем информацию о товарах
          const filter = `id=${productIds.join(';id=')}`;
          return this.http
            .get<{ rows: any[] }>(`${this.productUrl}?filter=${filter}&limit=1000`)
            .pipe(
              switchMap((productResponse) => {
                let products = productResponse.rows;

                // Фильтруем товары, убирая те, у которых trackingType === "NOT_TRACKED"
                products = products.filter(product => product.trackingType !== "NOT_TRACKED");

                if (products.length === 0) {
                  return throwError(() => new Error('В данной накладной нет товаров, подлежащих маркировке.'));
                }

                // Запрашиваем изображения и uom для отфильтрованных товаров
                const productRequests = products.map(product =>
                  forkJoin({
                    images: this.http.get<any>(`${this.productUrl}/${product.id}/images`).pipe(
                      catchError(() => of({ rows: [] }))
                    ),
                    uom: product.uom?.meta?.href
                      ? this.http.get<any>(this.convertToProxyUrl(product.uom.meta.href)).pipe(
                        map(uomResponse => ({
                          // Используем name из ответа, если доступен, иначе description как запасной вариант
                          name: uomResponse.name || uomResponse.description || 'шт.'
                        })),
                        catchError(() => of({ name: 'шт.' }))
                      )
                      : of({ name: 'шт.' })
                  }).pipe(
                    map(({ images, uom }) => ({
                      ...product,
                      images: images.rows,
                      uomName: uom.name
                    }))
                  )
                );

                return forkJoin(productRequests).pipe(
                  map(productsWithData => {
                    const productData = this.mapProductData(productsWithData);
                    return positions
                      .filter(row => productsWithData.some(p => p.id === row.assortment?.meta?.href.split('/product/')[1]))
                      .map(row => this.mapPosition(row, productData));
                  })
                );
              })
            );
        })
      );
  }

  private convertToProxyUrl(fullUrl: string): string {
    const apiPath = fullUrl.replace('https://api.moysklad.ru/api/remap/1.2', '');
    return `/api/moysklad${apiPath}`;
  }

  updateTrackingCodes(demandId: string, product: Product, newTrackingCode: string, action: 'add' | 'delete'): Observable<any> {
    const positionUrl = `${this.apiUrl}/${demandId}/positions/${product.id}`;

    // Разбиваем строку и извлекаем нужную часть
    const parts = newTrackingCode.split('\u001D');
    const cleanedTrackingCode = parts.length > 1 ? parts[1] : '';

    if (!cleanedTrackingCode) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'Неверный формат кода маркировки.' });
        observer.complete();
      });
    }

    return this.http.get<Product>(positionUrl).pipe(
      switchMap(existingProduct => {
        let trackingCodes = existingProduct.trackingCodes || [];

        if (action === 'add') {
          // Проверяем, есть ли код уже в списке
          if (trackingCodes.some(tc => tc.cis === cleanedTrackingCode)) {
            return new Observable(observer => {
              observer.next({ success: true, message: 'Этот код уже добавлен.' });
              observer.complete();
            });
          }
          // Добавляем код
          trackingCodes = [...trackingCodes, { cis: cleanedTrackingCode, type: 'trackingcode' }];
        }
        else if (action === 'delete') {
          // Проверяем, есть ли код в списке
          if (!trackingCodes.some(tc => tc.cis === cleanedTrackingCode)) {
            return new Observable(observer => {
              observer.next({ success: false, message: 'Код не найден.' });
              observer.complete();
            });
          }
          // Удаляем код
          trackingCodes = trackingCodes.filter(tc => tc.cis !== cleanedTrackingCode);
        }

        return this.http.put(positionUrl, { trackingCodes }).pipe(
          map(() => ({
            success: true,
            message: action === 'add' ? 'Код добавлен.' : 'Код удален.'
          }))
        );
      })
    );
  }


  getDemandInfo(demandId: string){
   return this.http.get(`${this.apiUrl}/${demandId}`)
  }

  private mapProductData(products: any[]): Record<string, any> {
    return products.reduce((acc, product) => {
      const gtin = product.barcodes?.find((barcode: any) => barcode.gtin)?.gtin || null;
      const firstImage = product.images?.[0];
      const imageUrl = firstImage?.miniature?.downloadHref || null;
      const uomName = product.uomName || 'шт.';  // Если `uom` нет, ставим "шт."

      acc[product.id] = {
        name: product.name,
        gtin: gtin,
        imageUrl: imageUrl,
        uom: uomName
      };
      return acc;
    }, {} as Record<string, any>);
  }


  private mapPosition(position: any, productData: Record<string, any>) {
    const productId = position.assortment?.meta?.href.match(/\/product\/([a-zA-Z0-9-]+)/)?.[1] || null;
    const product = productId ? productData[productId] : {
      name: 'Не является товаром',
      gtin: null,
      imageUrl: null,
      uom: "шт." // По умолчанию "шт."
    };

    return {
      id: position.id,
      name: product.name,
      quantity: position.quantity,
      trackingCodes: position.trackingCodes ? position.trackingCodes.length : 0,
      gtin: product.gtin,
      imageUrl: product.imageUrl,
      uom: product.uom // Добавляем единицу измерения
    };
  }

  updateDemandState(demandId: string, stateHref: string): Observable<any> {
    const url = `${this.apiUrl}/${demandId}`;
    return this.http.put(url, { state: { meta: { href: stateHref, type: 'state', mediaType: 'application/json' } } });
  }
}
