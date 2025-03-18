import {inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MoySkladService {
  http = inject(HttpClient)

  private readonly apiUrl = '/api/moysklad/entity/demand'; // Используем прокси

  constructor() {}

  /**
   * Получение позиций отгрузки по ID
   * @param demandId ID отгрузки
   * @returns Observable с данными позиций
   */

  getDemandPositions(demandId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${demandId}/positions`);
  }
}
