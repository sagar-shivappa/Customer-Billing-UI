import { Routes } from '@angular/router';
import { Home } from '../shared/home/home';
import { AddProductComponent } from '../features/add-product-component/add-product-component';
import { BillingEntryComponent } from '../features/billing-entry-component/billing-entry-component';
import { OwnerProfileComponent } from '../features/owner-profile-component/owner-profile-component';
import { CustomerComponent } from '../features/customer/customer';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', component: BillingEntryComponent },

      {
        path: 'products',
        component: AddProductComponent,
      },
      { path: 'owner', component: OwnerProfileComponent },
      { path: 'customer', component: CustomerComponent },
    ],
  },
];
