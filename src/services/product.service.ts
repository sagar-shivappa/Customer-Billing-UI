import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { PRODUCT_CATEGORIES } from '../app/core/config/product.categories.config';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly _products = signal<Product[]>([]);

  readonly products = this._products.asReadonly();

  addProduct(product: Product): void {
    this._products.update((products) => [...products, product]);
  }

  private readonly _productCategories = signal<string[]>([...PRODUCT_CATEGORIES]);
  readonly productCategories = this._productCategories.asReadonly();
  addProductcategory(category: string): void {
    this._productCategories.update((productCategories) => [...productCategories, category]);
  }
}
