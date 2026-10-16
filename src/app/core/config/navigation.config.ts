import { MenuItem } from '../../../models/menu-item.model';

export const NAVIGATION_ITEMS: MenuItem[] = [
  {
    label: 'Billing',
    icon: 'receipt_long',
    route: '/',
  },
  {
    label: 'Add / Edit Products',
    icon: 'assignment_add',
    route: '/products',
  },

  {
    label: 'Reports',
    icon: 'bar_chart',
    route: '/reports',
  },
  {
    label: 'Customers',
    icon: 'people',
    route: '/customer',
  },
  {
    label: 'Company',
    icon: 'manage_accounts',
    route: '/company',
  },
  {
    label: 'Support',
    icon: 'support_agent',
    route: '/support',
  },
];
