import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Product } from '../../models/product.model';

export function uniqueProductCodeValidator(getProducts: () => Product[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.trim().toLowerCase();

    if (!value) {
      return null;
    }

    const exists = getProducts().some(
      (product) => product.productCode.trim().toLowerCase() === value,
    );

    return exists ? { productCodeExists: true } : null;
  };
}
