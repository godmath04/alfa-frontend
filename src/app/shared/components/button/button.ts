import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: false,
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  @Input() variant: 'default' | 'primary' | 'outline' | 'ghost' | 'destructive' = 'default';
  @Input() size: 'small' | 'default' | 'large' = 'default';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' = 'button';

  @Output() clicked = new EventEmitter<void>();

  _onClick(): void {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}