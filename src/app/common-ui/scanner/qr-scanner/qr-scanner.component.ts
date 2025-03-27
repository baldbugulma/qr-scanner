import {Component, OnDestroy, Output, EventEmitter, signal, input} from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { BtnComponent } from '../../btn/btn.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  imports: [BtnComponent, NgIf],
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent {
  private html5Qrcode!: Html5Qrcode;

  action = input<string>('')
  @Output() scanResult = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  public isScannerActive = signal<boolean>(false);

  toggleScanner() {
    if (this.isScannerActive()) {
      this.stopScanning();
    } else {
      this.startScanning();
    }
  }

  startScanning() {
    this.isScannerActive.set(true);

    this.html5Qrcode = new Html5Qrcode("qr-reader");

    this.html5Qrcode.start(
      { facingMode: "environment" }, // Используем заднюю камеру
      {
        fps: 15,
        qrbox: { width: 250, height: 250 } // Размер области сканирования
      },
      (decodedText) => this.onScanSuccess(decodedText),
      (errorMessage) => this.onScanFailure(errorMessage)
    ).catch(err => {
      console.error("Failed to start scanning:", err);
    });
  }

  private onScanSuccess(decodedText: string) {
    this.scanResult.emit(decodedText);
    setTimeout(() => {
      this.stopScanning(); // Останавливаем сканирование уже после перехода
    }, 0);
  }

  private onScanFailure(error: string) {
    if (!error.includes("NotFoundException")) {
      this.scanError.emit(error);
      console.warn("Scan error:", error);
    }
  }

  stopScanning() {
    if (this.html5Qrcode) {
      this.html5Qrcode.stop().then(() => {
        this.isScannerActive.set(false);
      }).catch(error => {
        console.error('Failed to stop scanner:', error);
      });
    }
  }
}
