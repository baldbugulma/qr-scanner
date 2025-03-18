import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, switchMap} from 'rxjs';

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
            return [positions.map((row) => this.mapPosition(row, {}))];
          }

          // Получаем информацию о товарах
          const filter = `id=${productIds.join(';id=')}`;
          return this.http
            .get<{ rows: any[] }>(`${this.productUrl}?filter=${filter}&limit=1000`)
            .pipe(
              map((productResponse) => {
                const productData = this.mapProductData(productResponse.rows);
                return positions.map((row) => this.mapPosition(row, productData));
              })
            );
        })
      );
  }

  private mapProductData(products: any[]): Record<string, any> {
    return products.reduce((acc, product) => {
      const gtin = product.barcodes?.find((barcode: any) => barcode.gtin)?.gtin || null;
      acc[product.id] = {
        name: product.name,
        gtin: gtin,
      };
      return acc;
    }, {} as Record<string, any>);
  }

  private mapPosition(position: any, productData: Record<string, any>) {
    const productId = position.assortment?.meta?.href.match(/\/product\/([a-zA-Z0-9-]+)/)?.[1] || null;
    const product = productId ? productData[productId] : { name: 'Не является товаром', gtin: null };

    return {
      id: position.id,
      name: product.name,
      quantity: position.quantity,
      trackingCodes: position.trackingCodes ? position.trackingCodes.length : 0,
      gtin: product.gtin,
    };
  }
}
