import {Component, inject} from '@angular/core';
import {FeatureScannerComponent} from "../../../common-ui/scanner/feature-scanner/feature-scanner.component";
import {Router} from '@angular/router';
import {QrScannerComponent} from "../../../common-ui/scanner/qr-scanner/qr-scanner.component";

@Component({
  selector: 'app-home-page',
	imports: [
		QrScannerComponent
	],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  router = inject(Router)

  openShipments(id:string){
    this.router.navigate(['shipments', id])
  }
}
