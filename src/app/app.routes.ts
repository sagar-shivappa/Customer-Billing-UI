import { Routes } from '@angular/router';
import { Home } from '../shared/home/home';
import { AddProductComponent } from '../features/add-product-component/add-product-component';
import { BillingEntryComponent } from '../features/billing-entry-component/billing-entry-component';
import { OwnerProfileComponent } from '../features/owner-profile-component/owner-profile-component';
import { CustomerComponent } from '../features/customer/customer';
import { ReportsComponent } from '../features/reports-component/reports-component';
import { CustomerCare } from '../features/customer-care/customer-care';
import { licenseGuard } from '../guards/license.guard';
import { ownerAuthGuard } from '../guards/owner-auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    children: [
      { path: '', component: BillingEntryComponent, canActivate: [licenseGuard] },

      {
        path: 'products',
        component: AddProductComponent,
        canActivate: [licenseGuard],
      },
      { path: 'company', component: OwnerProfileComponent },
      { path: 'customer', component: CustomerComponent, canActivate: [licenseGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [licenseGuard, ownerAuthGuard] },
      { path: 'support', component: CustomerCare },
      { path: '**', redirectTo: 'support' },
    ],
  },
];
