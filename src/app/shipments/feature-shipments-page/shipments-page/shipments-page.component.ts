import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, map, switchMap} from 'rxjs';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {DatePipe, NgIf} from '@angular/common';

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


@Component({
  selector: 'app-shipments-page',
  imports: [BtnComponent, QrScannerComponent, DatePipe],
  templateUrl: './shipments-page.component.html',
  styleUrl: './shipments-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsPageComponent implements OnInit {
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
      )
    ).subscribe(({ positions, info }) => {
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

    this.moySkladService.updateTrackingCodes(this.id, product, trackingCodes).subscribe(res => {
      if (res.message === 'Этот код уже добавлен.') {
        this.errorMessage.set(res.message);
      } else {
        console.log("Код успешно добавлен:", res);
        this.loadData();
      }
    });
  }

  back() {
    this.route.navigate(['/']);
  }

  complite() {

    console.log(this.isFullyAssembled());
    const stateHref = this.isFullyAssembled()
      ? 'https://api.moysklad.ru/api/remap/1.2/entity/demand/metadata/states/18481224-fe6b-11ef-0a80-075e000db968'
      : 'https://api.moysklad.ru/api/remap/1.2/entity/demand/metadata/states/485a2571-032e-11f0-0a80-0ebe00318d13';

    this.moySkladService.updateDemandState(this.id, stateHref).subscribe(
      () => {
        console.log(`Статус отгрузки ${this.id} успешно обновлен.`);
        this.router.navigate(['/']);
      },
      (error) => {
        this.errorMessage.set(`Ошибка обновления статуса: ${error.message}`);
      }
    );
  }

}
