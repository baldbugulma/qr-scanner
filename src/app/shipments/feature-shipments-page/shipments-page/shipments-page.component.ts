import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, switchMap} from 'rxjs';
import {MoySkladService} from '../../../data-acces/moy-sklad/moy-sklad.service';
import {FeatureScannerComponent} from '../../../common-ui/scanner/feature-scanner/feature-scanner.component';

@Component({
  selector: 'app-shipments-page',
  imports: [
    FeatureScannerComponent
  ],
  templateUrl: './shipments-page.component.html',
  styleUrl: './shipments-page.component.scss'
})
export class ShipmentsPageComponent implements OnInit {
  activateRouter = inject(ActivatedRoute)
  moySkladService = inject(MoySkladService)
  items = signal<any | undefined>(undefined)
  id: string = ''

  constructor() {
  }

  ngOnInit() {
    this.activateRouter.params
      .pipe(
        map((params) => {
          this.id = params['id']
          return this.id
        }),
        switchMap((id) => {
          return this.moySkladService.getDemandPositions(id)
        })
      ).subscribe(res => {
        this.items.set(res)
      console.log(res)
    })
  }

  updateShipment(id: string){
    console.log(id)
  }
}
