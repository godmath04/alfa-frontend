import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Button } from './components/button/button';
import { InputField } from './components/input-field/input-field';
import { Spinner } from './components/spinner/spinner';

@NgModule({
  declarations: [Button, InputField, Spinner],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [Button, InputField, Spinner, FormsModule, ReactiveFormsModule],
})
export class SharedModule {}
