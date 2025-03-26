import { Routes } from '@angular/router';
import {
  ShipmentPageAddMarkComponent,
} from './shipments/feature-shipments-page/shipment-page-add-mark/shipment-page-add-mark.component';
import {HomePageComponent} from './home/feature-home-page/home-page/home-page.component';
import {
  OpenShipmentPageComponent
} from './shipments/feature-shipments-page/open-shipment-page/open-shipment-page.component';
import {
  EditShipmentPageComponent
} from './shipments/feature-shipments-page/edit-shipment-page/edit-shipment-page.component';

export const routes: Routes = [
  {path: '', component: HomePageComponent},
  {path: 'add-mark', component: OpenShipmentPageComponent},
  {path: 'add-mark/:id', component: ShipmentPageAddMarkComponent},
  {path: 'delete-mark', component: EditShipmentPageComponent},
  {path: 'delete-mark/:id', component: ShipmentPageAddMarkComponent}
];
