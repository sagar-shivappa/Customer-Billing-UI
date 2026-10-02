import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ProductService } from '../../services/product.service';
import { MatButtonModule } from '@angular/material/button';
import { Product } from '../../models/product.model';
import { OwnerProfileService } from '../../services/owner.service';

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
export class ProductCatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly ownerService = inject(OwnerProfileService);

  readonly products = this.productService.products;

  readonly search = signal('');

  readonly productSelected = output<Product>();

  readonly selectedCategory = signal<string>('All');

  ngOnInit(): void {
    this.productService.getAllProducts();
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  readonly productCategories = computed(() => this.ownerService.profile()?.productCategories ?? []);

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
