import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './product-catalog-component.html',
  styleUrl: './product-catalog-component.css',
})
export class ProductCatalogComponent {
  private readonly productService = inject(ProductService);

  readonly products = this.productService.products;

  readonly search = signal('');

  readonly filteredProducts = computed(() => {
    const value = this.search().toLowerCase().trim();

    if (!value) {
      return this.products();
    }

    return this.products().filter(
      (product) =>
        product.productName.toLowerCase().includes(value) ||
        product.productCode.toLowerCase().includes(value),
    );
  });
}
