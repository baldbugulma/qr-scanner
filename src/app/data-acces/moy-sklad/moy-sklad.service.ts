import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, forkJoin, map, Observable, of, switchMap} from 'rxjs';

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
                  return of(positions.map(row => this.mapPosition(row, {})));
                }

                // Запрашиваем изображения только для отфильтрованных товаров
                const imageRequests = products.map(product =>
                  this.http.get<any>(`${this.productUrl}/${product.id}/images`).pipe(
                    catchError(() => of({ rows: [] })), // Обработка ошибок
                    map(imagesResponse => ({
                      ...product,
                      images: imagesResponse.rows
                    }))
                  )
                );

                return forkJoin(imageRequests).pipe(
                  map(productsWithImages => {
                    const productData = this.mapProductData(productsWithImages);
                    return positions
                      .filter(row => productsWithImages.some(p => p.id === row.assortment?.meta?.href.split('/product/')[1]))
                      .map(row => this.mapPosition(row, productData));
                  })
                );
              })
            );
        })
      );
  }

  updateTrackingCodes(demandId: string, product: Product, newTrackingCode: string): Observable<any> {
    const positionUrl = `${this.apiUrl}/${demandId}/positions/${product.id}`;

    // Ищем часть строки между двумя символами \u001D (или )
    const parts = newTrackingCode.split('\u001D');

    // Извлекаем вторую часть, которая идет после первого символа \u001D и до второго
    const cleanedTrackingCode = parts.length > 1 ? parts[1] : '';

    if (!cleanedTrackingCode) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'Неверный формат кода маркировки.' });
        observer.complete();
      });
    }

    return this.http.get<Product>(positionUrl).pipe(
      switchMap(existingProduct => {
        // Проверяем, есть ли trackingCodes и если нет, создаем пустой массив
        const trackingCodes = existingProduct.trackingCodes || [];

        // Проверяем, есть ли код уже в списке
        if (trackingCodes.some(tc => tc.cis === cleanedTrackingCode)) {
          return new Observable(observer => {
            observer.next({ success: true, message: 'Этот код уже добавлен.' });
            observer.complete();
          });
        }

        // Добавляем новый код
        const updatedTrackingCodes = [...trackingCodes, { cis: cleanedTrackingCode, type: 'trackingcode' }];
        return this.http.put(positionUrl, { trackingCodes: updatedTrackingCodes });
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
      const uom = product.uom?.name || "шт."; // Если `uom` нет, ставим "шт."

      acc[product.id] = {
        name: product.name,
        gtin: gtin,
        imageUrl: imageUrl,
        uom: uom
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
