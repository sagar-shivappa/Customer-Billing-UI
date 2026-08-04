import { Component, computed, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { BillingService } from '../../services/billing.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './product-catalog-component.html',
  styleUrl: './product-catalog-component.css',
})
export class ProductCatalogComponent {
  private readonly productService = inject(ProductService);
  private readonly billingService = inject(BillingService);

  readonly products = this.productService.products;

  readonly search = signal('');

  readonly productSelected = output<Product>();

  readonly productCategories = this.productService.productCategories();

  readonly selectedCategory = signal<string>('All');

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  readonly filteredProducts = computed(() => {
    const searchValue = this.search().toLowerCase().trim();
    const selectedCategory = this.selectedCategory();

    return this.products().filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.productName.toLowerCase().includes(searchValue) ||
        product.productCode.toLowerCase().includes(searchValue);

      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  });

  selectProduct(product: Product): void {
    this.productSelected.emit(product);
  }
}
