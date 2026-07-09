import { Component, inject, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductCatalogComponent } from '../product-catalog-component/product-catalog-component';
import { PRODUCT_CATEGORIES } from '../../app/core/config/product.categories.config';
import { MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ProductCatalogComponent,
    MatSelectModule,
  ],
  templateUrl: './add-product-component.html',
  styleUrl: './add-product-component.css',
})
export class AddProductComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  readonly categories = PRODUCT_CATEGORIES;

  readonly productForm = this.fb.nonNullable.group({
    productName: ['', Validators.required],
    productCode: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  readonly productNameInput = viewChild<ElementRef<HTMLInputElement>>('productNameInput');

  readonly productCodeInput = viewChild<ElementRef<HTMLInputElement>>('productCodeInput');

  readonly categoryInput = viewChild(MatSelect);

  readonly priceInput = viewChild<ElementRef<HTMLInputElement>>('priceInput');

  ngAfterViewInit(): void {
    this.focusProductName();
  }

  focusProductCode(event: Event): void {
    event.preventDefault();

    this.productCodeInput()?.nativeElement.focus();
  }

  focusCategory(event: Event): void {
    event.preventDefault();
    this.categoryInput()?.open();
  }

  focusPrice(): void {
    requestAnimationFrame(() => {
      this.priceInput()?.nativeElement.focus();
      this.priceInput()?.nativeElement.select();
    });
  }

  submitFromPrice(event: Event): void {
    event.preventDefault();
    this.addProduct();
  }

  addProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productService.addProduct(this.productForm.getRawValue());

    this.productForm.reset({
      productName: '',
      productCode: '',
      category: '',
      price: 0,
    });

    this.focusProductName();
  }

  private focusProductName(): void {
    requestAnimationFrame(() => {
      this.productNameInput()?.nativeElement.focus();
    });
  }
}
