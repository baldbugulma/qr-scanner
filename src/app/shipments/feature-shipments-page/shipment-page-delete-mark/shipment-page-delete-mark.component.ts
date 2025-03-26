import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BtnComponent} from '../../../common-ui/btn/btn.component';
import {QrScannerComponent} from '../../../common-ui/scanner/qr-scanner/qr-scanner.component';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'shipment-page-add-mark',
  imports: [BtnComponent, QrScannerComponent, DatePipe],
  templateUrl: './shipment-page-add-mark.component.html',
  styleUrl: './shipment-page-add-mark.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentPageAddMarkComponent {

}
