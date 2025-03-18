import {Component, inject} from '@angular/core';
import {FeatureScannerComponent} from "../../../common-ui/scanner/feature-scanner/feature-scanner.component";
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
	imports: [
		FeatureScannerComponent
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
