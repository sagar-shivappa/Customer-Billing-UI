import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Product } from '../../models/product.model';
import { FormType } from '../../features/add-product-component/add-product-component';

export function uniqueProductCodeValidator(
  getProducts: () => Product[],
  getFormType: () => FormType,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    // Skip validation when updating
    if (getFormType() === FormType.Update) {
      return null;
    }
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
