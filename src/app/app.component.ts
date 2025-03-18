import { Component, inject } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import {BtnComponent} from './common-ui/btn/btn.component';
import {FeatureScannerComponent} from './common-ui/scanner/feature-scanner/feature-scanner.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'qr-scn';
  router = inject(Router)

  openShipments(id:string){
    this.router.navigate(['shipments', id])
  }
}
