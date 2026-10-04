export interface Customer {
  _id?: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  pincode?: string;
  gstin?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export interface CustomersResponse {
  success: boolean;
  message: string;
  data: Customer[];
}
