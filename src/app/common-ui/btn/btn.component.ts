import { Component, output } from '@angular/core';

@Component({
  selector: 'app-btn',
  imports: [],
  templateUrl: './btn.component.html',
  styleUrl: './btn.component.scss'
})
export class BtnComponent {
  action = output()

  actionBtn() {
    this.action.emit()
  }
}
