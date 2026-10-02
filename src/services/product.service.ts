import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCT_CATEGORIES } from '../app/core/config/product.categories.config';
import { app_config } from '../app/core/config/app.config';
import { HttpClient } from '@angular/common/http';

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products = signal<Product[]>([]);
  private readonly http = inject(HttpClient);

  readonly products = this._products.asReadonly();

  addProduct(product: Product): void {
    this.http.post(`${app_config.API_BASE_URL}/api/products`, product).subscribe({
      next: () => {
        this._products.update((products) => [...products, product]);
      },
      error: (error) => {
        // Don't modify products signal
        console.error('Failed to add product', error);
      },
    });
  }

  getAllProducts(): void {
    this.http.get<ProductResponse>(`${app_config.API_BASE_URL}/api/products`).subscribe({
      next: (response) => {
        this._products.set([...response.data]);
      },
      error: (error) => {
        // Don't modify products signal
        console.error('Failed to add product', error);
      },
    });
  }
}
