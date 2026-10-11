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
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

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
    MatTooltip,
  ],
  templateUrl: './product-catalog-component.html',
  styleUrl: './product-catalog-component.css',
})
export class ProductCatalogComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly ownerService = inject(OwnerProfileService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly products = this.productService.products;

  readonly search = signal('');

  readonly productSelected = output<Product>();

  readonly selectedCategory = signal<string>('All');

  readonly isProductsRoute = computed(() => this.router.url === '/products');

  ngOnInit(): void {
    this.productService.getAll();
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

  deleteProduct(product: Product): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Product?',
        message: `Are you sure you want to delete "${product.productName}"?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performDelete(product);
      }
    });
  }

  private performDelete(product: Product): void {
    this.productService.delete(product).subscribe({
      next: () => {
        this.productService.removeFromList(product._id!);
      },
      error: (error) => {
        console.error('Failed to delete product', error);
      },
    });
  }
}
