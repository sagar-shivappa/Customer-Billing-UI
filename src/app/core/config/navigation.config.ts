import { MenuItem } from '../../../models/menu-item.model';

export const NAVIGATION_ITEMS: MenuItem[] = [
  {
    label: 'Billing',
    icon: 'receipt_long',
    route: '/',
  },
  {
    label: 'Add Products',
    icon: 'assignment_add',
    route: '/products',
  },

  {
    label: 'Reports',
    icon: 'monitoring',
    route: '/reports',
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
    label: 'Support',
    icon: 'support',
    route: '/support',
  },
];
