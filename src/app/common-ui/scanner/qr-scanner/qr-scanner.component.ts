import {Component, OnDestroy, Output, EventEmitter, signal, input, OnInit, AfterViewInit} from '@angular/core';
import { Html5Qrcode } from 'html5-qrcode';
import { BtnComponent } from '../../btn/btn.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  imports: [BtnComponent, NgIf],
  standalone: true,
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements AfterViewInit{
  private html5Qrcode!: Html5Qrcode;

  action = input<string>('')
  @Output() scanResult = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  public isScannerActive = signal<boolean>(false);
  public scanCompleted = true; // флаг успешного сканирования

  ngAfterViewInit(){
    this.startScanning();
  }

  toggleScanner() {
    this.scanCompleted = !this.scanCompleted;
  }

  startScanning() {

    this.html5Qrcode = new Html5Qrcode("qr-reader");

    this.html5Qrcode.start(
      { facingMode: "environment" }, // Используем заднюю камеру
      {
        fps: 15,
        qrbox: { width: 200, height: 200 } // Размер области сканирования
      },
      (decodedText) => this.onScanSuccess(decodedText),
      (errorMessage) => this.onScanFailure(errorMessage)
    ).catch(err => {
      console.error("Failed to start scanning:", err);
    });
  }

  private onScanSuccess(decodedText: string) {
    if (this.scanCompleted){
      return;
    }
    this.scanResult.emit(decodedText);
    const beep = new Audio(window.location.origin + '/assets/audio/beep.mp3');

    beep.play().catch(error => console.error('Ошибка воспроизведения звука:', error));
    this.scanCompleted = true;
  }

  private onScanFailure(error: string) {
    if (!error.includes("NotFoundException")) {
      // console.warn("Scan error:", error);
    }
  }

  // stopScanning() {
  //   if (this.html5Qrcode) {
  //     this.html5Qrcode.stop().then(() => {
  //       this.isScannerActive.set(false);
  //     }).catch(error => {
  //       console.error('Failed to stop scanner:', error);
  //     });
  //   }
  // }
}
