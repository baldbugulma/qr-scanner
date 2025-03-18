import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, output, signal, ViewChild} from '@angular/core';
import {NgxScannerQrcodeComponent, ScannerQRCodeResult} from 'ngx-scanner-qrcode';
import { AfterViewInit } from '@angular/core';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-feature-scanner',
  standalone: true,
  imports: [NgxScannerQrcodeComponent],
  templateUrl: './feature-scanner.component.html',
  styleUrls: ['./feature-scanner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Можно временно убрать для теста
})
export class FeatureScannerComponent implements AfterViewInit {
  cdr = inject(ChangeDetectorRef)
  moySkladService = inject(MoySkladService)
  route = inject(ActivatedRoute)
  router = inject(Router)

  @ViewChild('scanner', { static: false }) scanner!: NgxScannerQrcodeComponent;

  resultScan = output<string>();

  ngAfterViewInit() {
    if (this.scanner) {
      this.scanner.start();
    }
  }

  onScanSuccess(data: ScannerQRCodeResult | undefined) {
    if (data && data.value) {
      this.resultScan.emit(data.value);
      this.scanner.stop();
    }
  }

  toggleScanner() {
    if (this.scanner.isStart) {
      this.scanner.stop();
    } else {
      this.scanner.start();
    }
    this.cdr.detectChanges(); // Обновляет шаблон
  }
}
