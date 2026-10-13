/** Single post office record from India Post pincode lookup API. */
export interface IndiaPostOffice {
  Name: string;
  Description: string;
  BranchType: string;
  DeliveryStatus: string;
  Circle: string;
  District: string;
  Division: string;
  Region: string;
  State: string;
  Country: string;
}

/** Raw India Post pincode lookup API payload item. */
export interface IndiaPostPincodeApiResponse {
  Message: string;
  Status: string;
  PostOffice: IndiaPostOffice[] | null;
}

/** Normalised pincode validation result for UI and hooks. */
export interface PincodeValidationResult {
  valid: boolean;
  pincode: string;
  message: string;
  postOffices: IndiaPostOffice[];
}
