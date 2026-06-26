import { Component, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-bill-panel',
  imports: [],
  templateUrl: './bill-panel.html',
  styleUrl: './bill-panel.css',
})
export class BillPanel {
  readonly products = inject(ProductService).products;
}
