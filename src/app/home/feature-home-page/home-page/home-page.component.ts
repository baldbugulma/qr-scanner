import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  standalone: true,
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {
  router = inject(Router)

  openShipments(){
    this.router.navigate(['add-mark'])
  }
  editShipments(){
    this.router.navigate(['delete-mark'])
  }
}
