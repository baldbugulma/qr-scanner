import {Component, inject} from '@angular/core';
import {FeatureScannerComponent} from "../../../common-ui/scanner/feature-scanner/feature-scanner.component";
import {Router} from '@angular/router';
import {QrScannerComponent} from "../../../common-ui/scanner/qr-scanner/qr-scanner.component";
import {BtnComponent} from "../../../common-ui/btn/btn.component";

@Component({
  selector: 'app-home-page',
	imports: [
		QrScannerComponent,
		BtnComponent
	],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  router = inject(Router)

  // openShipments(id:string){
  //     this.router.navigate(['shipments', id])
  // }
  openShipments(){
    this.router.navigate(['add-mark'])
  }
  editShipments(){
    this.router.navigate(['delete-mark'])
  }
}
