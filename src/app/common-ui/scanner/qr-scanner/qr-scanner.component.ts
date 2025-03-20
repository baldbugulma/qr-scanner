import {Component, OnInit, OnDestroy, Output, EventEmitter, AfterViewInit, signal} from '@angular/core';
import {Html5QrcodeScanner, Html5QrcodeScannerState, Html5QrcodeScanType} from 'html5-qrcode';
import { BtnComponent } from '../../btn/btn.component';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  imports: [
    BtnComponent
  ],
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnDestroy, AfterViewInit {
  private html5QrcodeScanner!: Html5QrcodeScanner;
  private stateCheckInterval!: number;
  @Output() scanResult = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  public isScannerReady = signal<boolean>(false);

  ngAfterViewInit() {
    this.initializeScanner();
  }

  private initializeScanner() {
    const config = {
      fps: 15,
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      facingMode: "environment"
    };

    this.html5QrcodeScanner = new Html5QrcodeScanner('qr-reader', config, false);

    this.html5QrcodeScanner.render(
      (decodedText) => this.onScanSuccess(decodedText),
      (errorMessage) => this.onScanFailure(errorMessage)
    );

    // Запускаем периодическую проверку состояния
    this.stateCheckInterval = window.setInterval(() => {
      const state = this.html5QrcodeScanner.getState();

      if (state === Html5QrcodeScannerState.SCANNING) {
        this.isScannerReady.set(true);
        console.log('Scanner is active');
        this.clearStateCheck();
      }

      // Дополнительная обработка других состояний при необходимости
      if (state === Html5QrcodeScannerState.NOT_STARTED) {
        console.log('Scanner not started yet');
      }
    }, 100); // Проверяем каждые 100 мс

    // На всякий случай: таймаут для остановки проверки через 10 секунд
    setTimeout(() => {
      this.clearStateCheck();
    }, 10000);
  }

  private clearStateCheck() {
    if (this.stateCheckInterval) {
      clearInterval(this.stateCheckInterval);
    }
  }

  private onScanSuccess(decodedText: string) {
    this.scanResult.emit(decodedText);
    this.html5QrcodeScanner.pause();
  }

  private onScanFailure(error: string) {
    if (!error.includes("NotFoundException")) {
      this.scanError.emit(error);
      console.warn("Scan error:", error);
    }
  }

  resumeScanning() {
    this.html5QrcodeScanner.resume();
  }

  ngOnDestroy() {
    this.html5QrcodeScanner.clear().catch(error => {
      console.error('Failed to clear html5QrcodeScanner', error);
    });
  }
}
