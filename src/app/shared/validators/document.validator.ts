// src/app/shared/validators/document.validator.ts
import { AbstractControl, ValidationErrors } from '@angular/forms';

export class DocumentValidators {
  
  // Lo definimos como método estático para poder usarlo en cualquier lado sin instanciar la clase
  static cedula(control: AbstractControl): ValidationErrors | null {
    const cedula = control.value;
    
    if (!cedula) return null; // Si está vacío, de eso se encarga Validators.required

    // 1. Validar longitud y que sean solo números
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) {
      return { invalidCedula: true };
    }

    // 2. Validar provincia
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) {
      return { invalidCedula: true };
    }

    // 3. Validar tercer dígito (personas naturales)
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito > 5) {
      return { invalidCedula: true };
    }

    // 4. Módulo 10
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

    return null; // Es válida
  }

  static pasaporte(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    // Regla: Alfanumérico, entre 6 y 15 caracteres
    const passportRegex = /^[a-zA-Z0-9]{6,15}$/;
    const valid = passportRegex.test(value);
    
    return valid ? null : { invalidPassport: true };
  }
}
