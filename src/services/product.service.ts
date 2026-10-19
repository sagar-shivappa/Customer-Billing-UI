import { inject, Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { app_config } from '../app/core/config/app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductListResponse {
  success: boolean;
  message: string;
  data: Product[];
}

export interface ProductResponse {
  success: boolean;
  message: string;
  data: Product;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products = signal<Product[]>([]);
  private readonly http = inject(HttpClient);

  readonly products = this._products.asReadonly();

  add(product: Product): void {
    this.http.post<ProductResponse>(`${app_config.API_BASE_URL}/api/products`, product).subscribe({
      next: (response: ProductResponse) => {
        this._products.update((products) => [...products, response.data]);
      },
      error: (error) => {
        // Don't modify products signal
        console.error('Failed to add product', error);
      },
    });
  }

  update(product: Product): void {
    this.http
      .put<Product>(`${app_config.API_BASE_URL}/api/products/${product._id}`, product)
      .subscribe({
        next: () => {
          this._products.update((products) =>
            products.map((p) => (p._id === product._id ? product : p)),
          );
        },
        error: (error) => {
          console.error('Failed to update product', error);
        },
      });
  }

  getAll(): void {
    this.http.get<ProductListResponse>(`${app_config.API_BASE_URL}/api/products`).subscribe({
      next: (response) => {
        this._products.set([...response.data]);
      },
      error: (error) => {
        // Don't modify products signal
        console.error('Failed to add product', error);
      },
    });
  }

  delete(product: Product): Observable<void> {
    return this.http.delete<void>(`${app_config.API_BASE_URL}/api/products/${product._id}`);
  }

  removeFromList(productId: string): void {
    this._products.update((products) => products.filter((product) => product._id !== productId));
  }
}
