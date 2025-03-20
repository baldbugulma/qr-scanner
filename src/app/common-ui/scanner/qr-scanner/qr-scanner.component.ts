import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss']
})
export class QrScannerComponent implements OnInit, OnDestroy {
  private html5QrcodeScanner!: Html5QrcodeScanner;
  @Output() scanResult = new EventEmitter<string>();
  @Output() scanError = new EventEmitter<string>();

  ngOnInit() {
    this.initializeScanner();
  }

  private initializeScanner() {
    const config = {
      fps: 15,
      qrbox: { width: 300, height: 300 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      facingMode: "environment"
    };

    this.html5QrcodeScanner = new Html5QrcodeScanner(
      'qr-reader',
      config,
      false
    );

    this.html5QrcodeScanner.render(
      (decodedText, decodedResult) => this.onScanSuccess(decodedText, decodedResult),
      (errorMessage) => this.onScanFailure(errorMessage)
    );
  }

  private onScanSuccess(decodedText: string, decodedResult: any) {
    this.scanResult.emit(decodedText);
    this.html5QrcodeScanner.clear().catch(error => {
      console.error('Failed to clear scanner after successful scan', error);
    });
  }

  private onScanFailure(error: string) {
    if (!error.includes("NotFoundException")) {
      this.scanError.emit(error);
      console.warn("Scan error:", error);
    }
  }

  ngOnDestroy() {
    this.html5QrcodeScanner.clear().catch(error => {
      console.error('Failed to clear html5QrcodeScanner', error);
    });
  }
}
