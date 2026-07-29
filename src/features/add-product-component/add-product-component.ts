import { Component, inject, AfterViewInit, ElementRef, viewChild, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ProductCatalogComponent } from '../product-catalog-component/product-catalog-component';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

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
    FormsModule,
    MatIcon,
  ],
  templateUrl: './add-product-component.html',
  styleUrl: './add-product-component.css',
})
export class AddProductComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly productForm = this.fb.nonNullable.group({
    productName: ['', Validators.required],
    productCode: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(1)]],
  });

  readonly productNameInput = viewChild<ElementRef<HTMLInputElement>>('productNameInput');

  readonly productCodeInput = viewChild<ElementRef<HTMLInputElement>>('productCodeInput');

  @ViewChild('categoryInput') categoryInput!: MatSelect;

  readonly priceInput = viewChild<ElementRef<HTMLInputElement>>('priceInput');

  readonly categories = this.productService.productCategories;

  enableNewCategory = signal(true);
  readonly newCategory = signal('');

  ngAfterViewInit(): void {
    this.focusProductName();
  }

  focusProductCode(event: Event): void {
    event.preventDefault();

    this.productCodeInput()?.nativeElement.focus();
  }

  focusPrice(): void {
    requestAnimationFrame(() => {
      this.priceInput()?.nativeElement.focus();
      this.priceInput()?.nativeElement.select();
    });
  }

  focusCategory(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    keyboardEvent.preventDefault();

    requestAnimationFrame(() => {
      this.categoryInput?.focus();
      this.categoryInput?.open();
    });
  }

  submitFromCategory(): void {
    this.addProduct();
  }

  addProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productService.addProduct(this.productForm.getRawValue());

    this.clear();
  }

  clear() {
    this.productForm.reset({
      productName: '',
      productCode: '',
      category: '',
      price: 0,
    });

    this.focusProductName();
  }

  onAction(): void {
    if (this.productForm.valid) {
      this.addProduct();
    } else {
      this.clear();
    }
  }

  private focusProductName(): void {
    requestAnimationFrame(() => {
      this.productNameInput()?.nativeElement.focus();
    });
  }

  addNewCategory() {
    if (this.newCategory() != '') {
      this.productService.addProductCategory(this.newCategory());
    }

    this.enableNewCategory.set(true);
    this.newCategory.set('');
  }
}
