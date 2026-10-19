export interface OwnerProfile {
  _id?: string;
  profileKey?: string;
  shopName: string;
  address: string;
  pinCode: string;
  gstin: string;
  productCategories?: string[];
  stockManagement: boolean;
  includeGst: boolean;
  gstPercentage: number;
  softwareExpiryDate?: string;
  __v?: number;
}

export interface OwnerProfileResponse {
  success: boolean;
  message: string;
  data: OwnerProfile;
}
