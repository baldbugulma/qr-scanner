import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-shipments-page',
  imports: [QrScannerComponent],
  templateUrl: './open-shipment-page.component.html',
  styleUrl: './open-shipment-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenShipmentPageComponent {
  router = inject(Router)

  openShipments(id:string){
    this.router.navigate(['add-mark', id])
  }
}
