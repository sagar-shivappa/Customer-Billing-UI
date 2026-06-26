import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products = signal<Product[]>([]);

  readonly products = this._products.asReadonly();

  addProduct(product: Product): void {
    this._products.update((products) => [...products, product]);
  }
}
