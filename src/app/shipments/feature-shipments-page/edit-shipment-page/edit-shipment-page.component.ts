import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';

@Component({
  selector: 'app-shipments-page',
  imports: [BtnComponent, QrScannerComponent, DatePipe],
  templateUrl: './edit-shipment-page.component.html',
  styleUrl: './edit-shipment-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditShipmentPageComponent {
  router = inject(Router)

  editShipment(id:string){
    this.router.navigate(['delete-mark', id])
  }
}
