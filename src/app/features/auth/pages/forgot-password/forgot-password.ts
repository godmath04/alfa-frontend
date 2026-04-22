import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { ForgotPasswordViewModel } from './forgot-password.view-model';
import { Translate } from '../../../../core/services/translate';
import { Button } from '../../../../shared/components/button/button';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule, Button, Spinner],
  providers: [ForgotPasswordViewModel],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {

  readonly vm        = inject(ForgotPasswordViewModel);
  readonly translate = inject(Translate);

  private readonly _fb = inject(FormBuilder);

  forgotForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailError(): string {
    const control = this.forgotForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return this.translate.get('common.errors.required');
      if (control.errors['email'])    return this.translate.get('common.errors.invalid-email');
    }
    return '';
  }

  _onSubmit(): void {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    const { email } = this.forgotForm.value;
    this.vm.sendLink(email!);
  }
}
