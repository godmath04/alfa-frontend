import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, User, Stethoscope, BarChart3 } from 'lucide-angular';

import { Button } from './components/button/button';
import { InputField } from './components/input-field/input-field';
import { Spinner } from './components/spinner/spinner';

@NgModule({
  declarations: [Button, InputField, Spinner],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule.pick({ Mail, Lock, Eye, EyeOff, User, Stethoscope, BarChart3 })
  ],
  exports: [
    Button,
    InputField,
    Spinner,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule
  ]
})
export class SharedModule {}