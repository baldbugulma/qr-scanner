import {Component, EventEmitter, input, output} from '@angular/core';

@Component({
  selector: 'modal-img',
  templateUrl: './modal-img.component.html',
  imports: [],
  standalone: true,
  styleUrls: ['./modal-img.component.scss']
})
export class ModalImgComponent {
  imgUrl = input<string | null>(null)
  close = output<void>()

  closeModal(){
    console.log('Закрыть модалку')
    this.close.emit();
  }
}
