import { Component, OnInit, inject, effect } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

import { ProfileViewModel } from '../../profile.view-model';
import { Translate } from '../../../../core/services/translate';
import { Button } from '../../../../shared/components/button/button';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { Spinner } from '../../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, Button, InputField, Spinner],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss'
})
export class ProfilePage implements OnInit {
  private readonly _fb = inject(NonNullableFormBuilder);
  readonly vm = inject(ProfileViewModel);
  readonly translate = inject(Translate);

  readonly profileForm = this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    city: ['', Validators.required],
    gender: ['', Validators.required],
    birthDate: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    idType: [{ value: '', disabled: true }],
    idNumber: [{ value: '', disabled: true }],
  });

  constructor() {
    effect(() => {
      const profile = this.vm.profile();
      if (profile) {
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          city: profile.city,
          gender: profile.gender,
          birthDate: profile.birthDate,
          email: profile.email,
          idType: profile.idType,
          idNumber: profile.idNumber
        });
      }
    });
  }

  ngOnInit(): void {
    this.vm.loadProfile();
  }

  _onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const data = this.profileForm.getRawValue();
    this.vm.updateProfile(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        city: data.city,
        gender: data.gender,
        birthDate: data.birthDate
      },
      () => alert(this.translate.get('profile.successMessage')),
      () => alert(this.translate.get('profile.errorMessage'))
    );
  }

  _onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.vm.uploadPhoto(input.files[0]);
    }
  }

  _triggerFileInput(): void {
    document.getElementById('photoInput')?.click();
  }
}
