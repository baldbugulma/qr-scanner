import { Routes } from '@angular/router';
import {ShipmentsPageComponent} from './shipments/feature-shipments-page/shipments-page/shipments-page.component';
import {HomePageComponent} from './home/feature-home-page/home-page/home-page.component';

export const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'shipments/:id', component: ShipmentsPageComponent}
];
