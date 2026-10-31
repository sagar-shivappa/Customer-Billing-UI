export interface SoftwareSupportConfig {
  companyName: string;
  primaryContact: {
    name: string;
    phone: string;
  };
  secondaryContact: {
    name: string;
    phone: string;
  };
  supportEmail: string;
  logoPath: string;
}

export const SOFTWARE_SUPPORT_CONFIG: SoftwareSupportConfig = {
  companyName: 'Ashraya Software Solutions',

  primaryContact: {
    name: 'Sagar R Shivappa',
    phone: '6360959764',
  },

  secondaryContact: {
    name: 'Asha A',
    phone: '9964449607',
  },

  supportEmail: 'shivappasagar@gmail.com',

  logoPath: 'images/logo.png',
};
