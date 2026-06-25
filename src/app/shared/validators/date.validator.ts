import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class DateValidators {
  /**
   * Cross-field validator to check if birthdate fields compose a date at least 18 years in the past.
   */
  static ageAtLeast18(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const day = formGroup.get('birthDay')?.value;
      const month = formGroup.get('birthMonth')?.value;
      const year = formGroup.get('birthYear')?.value;

      const yearControl = formGroup.get('birthYear');

      if (!day || !month || !year) {
        return null; // Let standard Validators.required handle individual empty fields
      }

      const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Calculate age
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        if (yearControl) {
          const errors = yearControl.errors || {};
          yearControl.setErrors({ ...errors, underage: true });
        }
        return { underage: true };
      } else {
        if (yearControl && yearControl.hasError('underage')) {
          const errors = { ...yearControl.errors };
          delete errors['underage'];
          yearControl.setErrors(Object.keys(errors).length ? errors : null);
        }
        return null;
      }
    };
  }
}
