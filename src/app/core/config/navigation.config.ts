import { MenuItem } from '../../../models/menu-item.model';

export const NAVIGATION_ITEMS: MenuItem[] = [
  {
    label: 'Billing',
    icon: 'receipt_long',
    route: '/',
  },
  {
    label: 'Products',
    icon: 'assignment_add',
    route: '/products',
  },

  {
    label: 'Customers',
    icon: 'people',
    route: '/customer',
  },

  {
    label: 'Owner',
    icon: 'manage_accounts',
    route: '/owner',
  },

  {
    label: 'Reports',
    icon: 'monitoring',
    route: '/reports',
  },
];
