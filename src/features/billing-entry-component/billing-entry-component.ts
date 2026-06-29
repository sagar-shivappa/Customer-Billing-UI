import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent } from '@angular/material/card';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ProductService } from '../../services/product.service';
import { ProductCatalogComponent } from '../product-catalog-component/product-catalog-component';
import { BillingService } from '../../services/billing.service';
import { Item } from '../../models/bill.model';

@Component({
  selector: 'app-billing-entry',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    ProductCatalogComponent,
  ],
  templateUrl: './billing-entry-component.html',
  styleUrl: './billing-entry-component.css',
})
export class BillingEntryComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);
  private readonly billingService = inject(BillingService);
  readonly products = this.productService.products;

  readonly billingForm = this.fb.nonNullable.group({
    productCode: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  readonly productInput = viewChild<ElementRef<HTMLInputElement>>('productInput');

  readonly quantityInput = viewChild<ElementRef<HTMLInputElement>>('quantityInput');

  ngAfterViewInit(): void {
    this.focusProductInput();
  }

  add(): void {
    if (this.billingForm.invalid) {
      return;
    }

    this.billingService.addItem(this.billingForm.value as Item);

    this.billingForm.reset({
      productCode: '',
      quantity: 1,
    });

    this.focusProductInput();
  }

  private focusProductInput(): void {
    requestAnimationFrame(() => {
      this.productInput()?.nativeElement.focus();
    });
  }

  focusQuantity(event: Event): void {
    event.preventDefault();

    this.quantityInput()?.nativeElement.focus();
    this.quantityInput()?.nativeElement.select();
  }

  submitFromQuantity(event: Event): void {
    event.preventDefault();
    this.add();
  }
}
