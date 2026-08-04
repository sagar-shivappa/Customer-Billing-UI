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
import { uniqueProductCodeValidator } from '../../shared/validators/product-validator';
import { Product } from '../../models/product.model';
import { TitleCasePipe } from '@angular/common';

export enum FormType {
  New = 'new',
  Update = 'update',
}

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
    TitleCasePipe,
  ],
  templateUrl: './add-product-component.html',
  styleUrl: './add-product-component.css',
})
export class AddProductComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  readonly productForm = this.fb.nonNullable.group({
    productName: ['', Validators.required],
    productCode: [
      '',
      [
        Validators.required,
        uniqueProductCodeValidator(
          () => this.productService.products(),
          () => this.formType,
        ),
      ],
    ],
    category: ['', Validators.required],
    purchasePrice: [0, [Validators.min(1)]],
    sellingPrice: [0, [Validators.required, Validators.min(1)]],
    stock: [0],
  });

  formType: FormType = FormType.New;

  readonly productNameInput = viewChild<ElementRef<HTMLInputElement>>('productNameInput');

  readonly productCodeInput = viewChild<ElementRef<HTMLInputElement>>('productCodeInput');

  @ViewChild('categoryInput') categoryInput!: MatSelect;

  readonly sellingPrice = viewChild<ElementRef<HTMLInputElement>>('sellingPrice');

  readonly purchasePrice = viewChild<ElementRef<HTMLInputElement>>('purchasePrice');

  readonly stock = viewChild<ElementRef<HTMLInputElement>>('stock');

  readonly categories = this.productService.productCategories;

  enableNewCategory = true;
  readonly newCategory = signal('');

  ngAfterViewInit(): void {
    this.focusProductName();
  }

  focusProductCode(event: Event): void {
    event.preventDefault();

    this.productCodeInput()?.nativeElement.focus();
  }

  focusSellingPrice(): void {
    requestAnimationFrame(() => {
      this.sellingPrice()?.nativeElement.focus();
      this.sellingPrice()?.nativeElement.select();
    });
  }

  focusPurchasePrice(): void {
    requestAnimationFrame(() => {
      this.purchasePrice()?.nativeElement.focus();
      this.purchasePrice()?.nativeElement.select();
    });
  }

  focusStock(): void {
    requestAnimationFrame(() => {
      this.stock()?.nativeElement.focus();
      this.stock()?.nativeElement.select();
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

  private focusProductName(): void {
    requestAnimationFrame(() => {
      this.productNameInput()?.nativeElement.focus();
    });
  }

  saveProduct(): void {
    if (this.formType === 'new') this.productService.addProduct(this.productForm.getRawValue());
    else this.formType === 'update';

    this.clear();
  }

  clear() {
    this.productForm.reset({
      productName: '',
      productCode: '',
      category: '',
      sellingPrice: 0,
      purchasePrice: 0,
    });
    this.formType = FormType.New;
    this.focusProductName();
  }

  addNewCategory() {
    if (this.newCategory() != '') {
      this.productService.addProductCategory(this.newCategory());
    }

    this.enableNewCategory = true;
    this.newCategory.set('');
  }

  editProduct(product: Product) {
    this.formType = FormType.Update;
    this.productForm.patchValue({
      productName: product.productName,
      productCode: product.productCode,
      category: product.category,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      purchasePrice: product.purchasePrice,
    });
  }
}
