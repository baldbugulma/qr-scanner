import { Component, output } from '@angular/core';

@Component({
  selector: 'app-btn',
  imports: [],
  templateUrl: './btn.component.html',
  standalone: true,
  styleUrl: './btn.component.scss'
})
export class BtnComponent {
  action = output()

  actionBtn() {
    this.action.emit()
  }
}
