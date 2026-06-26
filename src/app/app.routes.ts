import { Routes } from '@angular/router';
import { sample } from '../shared/sample/sample';
import { Home } from '../shared/home/home';
import { AddProductComponent } from '../features/add-product-component/add-product-component';
import { BillingEntryComponent } from '../features/billing-entry-component/billing-entry-component';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', component: BillingEntryComponent },
      {
        path: 'sample',
        component: sample,
      },
      {
        path: 'products',
        component: AddProductComponent,
      },
    ],
  },
];
