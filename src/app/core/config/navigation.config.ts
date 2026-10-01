import { MenuItem } from '../../../models/menu-item.model';

export const NAVIGATION_ITEMS: MenuItem[] = [
  {
    label: 'Billing',
    icon: 'receipt_long',
    route: '/',
  },
  {
    label: 'Products',
    icon: 'inventory_2',
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
    label: 'Settings',
    icon: 'monitoring',
    route: '/settings',
  },
];
