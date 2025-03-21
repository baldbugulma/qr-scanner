import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {forkJoin, map, switchMap} from 'rxjs';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-shipments-page',
  imports: [BtnComponent, QrScannerComponent],
  templateUrl: './shipments-page.component.html',
  styleUrl: './shipments-page.component.scss'
})
export class ShipmentsPageComponent implements OnInit {
  activateRouter = inject(ActivatedRoute);
  moySkladService = inject(MoySkladService);
  route = inject(Router);

  infoDemand = signal<any | undefined>(undefined);
  items = signal<any | undefined>(undefined);
  id: string = '';

  errorMessage = signal<string | null>(null); // Для вывода ошибки

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
        this.errorMessage.set(res.message); // Устанавливаем сообщение об ошибке
      } else {
        console.log("Код успешно добавлен:", res);
        this.loadData();
      }
    });
  }

  back() {
    this.route.navigate(['/']);
  }
}
