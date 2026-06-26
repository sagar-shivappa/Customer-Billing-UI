import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-product-component.html',
  styleUrl: './add-product-component.css',
})
export class AddProductComponent {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly productForm = this.fb.nonNullable.group({
    productName: ['', Validators.required],
    productCode: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  addProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productService.addProduct(this.productForm.getRawValue());

    this.productForm.reset({
      productName: '',
      productCode: '',
      price: 0,
    });
  }
}
