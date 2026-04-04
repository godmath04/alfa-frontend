import { AbstractControl, ValidationErrors } from '@angular/forms';

export class PatternValidators {
  /**
   * Validates that the password contains at least:
   * 1 lowercase, 1 uppercase, and 1 special character
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null; // If empty, Validators.required should catch it
    
    const regex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])/;
    // Return a specific error object instead of the generic 'pattern'
    return regex.test(value) ? null : { invalidPasswordPattern: true };
  }

  /**
   * Validates a basic phone format (Ecuadorian/international),
   * allowing the optional '+' prefix and between 7 and 15 digits.
   */
  static phoneEcuador(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const regex = /^\+?\d{7,15}$/;
    return regex.test(value) ? null : { invalidPhonePattern: true };
  }
}
