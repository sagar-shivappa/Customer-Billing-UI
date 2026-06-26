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
    route: '/customers',
  },
  {
    label: 'Settings',
    icon: 'settings',
    route: '/settings',
  },
];
