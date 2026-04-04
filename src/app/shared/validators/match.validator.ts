import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class MatchValidators {
  /**
   * Cross-field validator to check that two fields match.
   * Applied to the FormGroup, not to an individual control.
   */
  static password(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      // If the confirmation field already has other errors (e.g., required), do not overwrite them
      if (matchingControl.errors && !matchingControl.errors['passwordMismatch']) {
        return null;
      }

      // If values do not match, set the error on the confirmation control
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }
}
