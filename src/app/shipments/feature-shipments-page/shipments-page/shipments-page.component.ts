import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap} from 'rxjs';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {FeatureScannerComponent} from '../../../common-ui/scanner/feature-scanner/feature-scanner.component';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-shipments-page',
  imports: [
    BtnComponent,
    QrScannerComponent,
  ],
  templateUrl: './shipments-page.component.html',
  styleUrl: './shipments-page.component.scss'
})
export class ShipmentsPageComponent implements OnInit {
  activateRouter = inject(ActivatedRoute)
  moySkladService = inject(MoySkladService)
  route= inject(Router)


  items = signal<any | undefined>(undefined)
  id: string = ''

  constructor() {
  }

  ngOnInit() {
    this.loadData()
  }

  private loadData(){
    this.activateRouter.params.pipe(
      map((params) => {
        this.id = params['id']
        return this.id
      }),
      switchMap((id) => {
        return this.moySkladService.getDemandPositions(id)
      })
    ).subscribe(res => this.items.set(res))
  }

  updateShipment(trackingCodes: string){
    console.log(`Отсканированный код ` + trackingCodes)
    const match = trackingCodes.match(/01(\d{14})21([^\u001d]+)/);
    if (!match) {
      console.error("Некорректный код маркировки!");
      return;
    }

    const gtin = match[1];
    const serial = match[2];

    const items = this.items();
    if (!items || !Array.isArray(items)) {
      console.error("Ошибка: items() вернуло некорректное значение!");
      return;
    }

    const product = items.find(item => item.gtin === gtin);

    console.log(product)
    console.log('Новый код маркировки ' + trackingCodes)

    this.moySkladService.updateTrackingCodes(this.id, product, trackingCodes).subscribe(res => {
      console.log(res)
      this.loadData()
    })
  }

  back(){
    this.route.navigate(['/'])
  }
}
