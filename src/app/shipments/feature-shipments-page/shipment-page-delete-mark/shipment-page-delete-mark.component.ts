import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {DatePipe} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {catchError, forkJoin, map, of, switchMap} from 'rxjs';

@Component({
  selector: 'shipment-page-delete-mark',
  imports: [
    QrScannerComponent,
    DatePipe,
    BtnComponent
  ],
  templateUrl: './shipment-page-delete-mark.component.html',
  styleUrl: './shipment-page-delete-mark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentPageDeleteMarkComponent implements OnInit{
  activateRouter = inject(ActivatedRoute);
  moySkladService = inject(MoySkladService);
  route = inject(Router);
  router = inject(Router)

  infoDemand = signal<any | undefined>(undefined);
  items = signal<any | undefined>(undefined);
  errorMessage = signal<string | null>(null);
  id: string = '';

  isFullyAssembled = computed(() => {
    const products = this.items();
    if (!Array.isArray(products)) return false;
    return products.every(product =>
      Number(product.trackingCodes) >= Number(product.quantity)
    );
  });

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.activateRouter.params.pipe(
      map((params) => {
        this.id = params['id'];
        return this.id;
      }),
      switchMap((id) =>
        forkJoin({
          positions: this.moySkladService.getDemandPositions(id),
          info: this.moySkladService.getDemandInfo(id),
        })
      ),
      catchError((error) => {
        this.errorMessage.set(error.message || 'Произошла ошибка при загрузке данных.');
        return of({ positions: [], info: null });
      })
    ).subscribe(({ positions, info }) => {
      console.log(this.errorMessage());
      this.items.set(positions);
      this.infoDemand.set(info);
    });
  }

  updateShipment(trackingCodes: string) {
    console.log(`Отсканированный код ` + trackingCodes);
    this.errorMessage.set(null); // Сброс ошибки перед проверкой

    const match = trackingCodes.match(/01(\d{14})21([^\u001d]+)/);
    if (!match) {
      this.errorMessage.set("Некорректный код маркировки!");
      return;
    }

    const gtin = match[1];
    const serial = match[2];

    const items = this.items();
    if (!items || !Array.isArray(items)) {
      this.errorMessage.set("Ошибка: неверный формат данных!");
      return;
    }

    const product = items.find(item => item.gtin === gtin);
    if (!product) {
      this.errorMessage.set("Продукт с таким GTIN не найден!");
      return;
    }

    this.moySkladService.updateTrackingCodes(this.id, product, trackingCodes, 'delete').subscribe(res => {
      if (res.message === 'Этот код уже добавлен.') {
        this.errorMessage.set(res.message);
      } else {
        console.log("Код успешно удален:", res);
        this.loadData();
      }
    });
  }

  back() {
    this.route.navigate(['/']);
  }

}
