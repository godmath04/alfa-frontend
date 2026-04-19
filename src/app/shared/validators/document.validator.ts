import { AbstractControl, ValidationErrors } from '@angular/forms';

export class DocumentValidators {
  
  // Defined as a static method so it can be used anywhere without instantiating the class
  static cedula(control: AbstractControl): ValidationErrors | null {
    const cedula = control.value;
    
    if (!cedula) return null; // If empty, Validators.required will handle it

    // 1. Validate length and ensure it only contains numbers
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return { invalidCedula: true };
    }

    // 2. Validate province
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) {
      return { invalidCedula: true };
    }

    // 3. Validate third digit (natural persons)
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito > 5) {
      return { invalidCedula: true };
    }

    // 4. Modulo 10
    const digitos = cedula.split('').map(Number);
    const digitoVerificador = digitos.pop();
    let suma = 0;

    for (let i = 0; i < digitos.length; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor = valor * 2;
        if (valor > 9) valor = valor - 9;
      }
      suma += valor;
    }

    const decenaSuperior = Math.ceil(suma / 10) * 10;
    let calculado = decenaSuperior - suma;
    if (calculado === 10) calculado = 0;

    if (calculado !== digitoVerificador) {
      return { invalidCedula: true };
    }

    return null; // It is valid
  }

  static pasaporte(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Rule: Alphanumeric, between 6 and 15 characters
    const passportRegex = /^[a-zA-Z0-9]{6,15}$/;
    const valid = passportRegex.test(value);
    
    return valid ? null : { invalidPassport: true };
  }
}
