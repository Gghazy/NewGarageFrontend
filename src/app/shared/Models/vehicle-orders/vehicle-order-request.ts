export interface ExaminationItemRequest {
  serviceId: string;
  quantity: number;
  overridePrice?: number;
}

export interface CreateExaminationRequest {
  // Client
  clientId?: string;
  clientType: string;           // "Individual" | "Company"
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;
  clientEmail?: string;
  clientResourceId?: string;

  // Individual address
  individualAddress?: string;

  // Company fields
  commercialRegister?: string;
  taxNumber?: string;

  // Company structured address
  streetName?: string;
  additionalStreetName?: string;
  cityName?: string;
  postalZone?: string;
  countrySubentity?: string;
  countryCode?: string;
  buildingNumber?: string;
  citySubdivisionName?: string;

  // Branch
  branchId?: string;

  // Examination meta
  type: string;                 // "Regular" | "Warranty" | "PrePurchase"
  hasWarranty: boolean;
  marketerCode?: string;
  notes?: string;

  // Vehicle
  manufacturerId?: string;
  carMarkId?: string;
  year?: number;
  color?: string;
  vin?: string;
  hasPlate: boolean;
  plateLetters?: string;
  plateNumbers?: string;
  mileage?: number;
  mileageUnit: string;          // "Km" | "Mile"
  transmission?: string;        // "Automatic" | "Manual" | "CVT" | "SemiAutomatic"

  // Services
  items: ExaminationItemRequest[];

  // Workflow
  startAfterSave?: boolean;
}

export interface UpdateExaminationRequest {
  // Client
  clientType: string;
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;
  clientEmail?: string;
  clientResourceId?: string;

  // Individual address
  individualAddress?: string;

  // Company fields
  commercialRegister?: string;
  taxNumber?: string;

  // Company structured address
  streetName?: string;
  additionalStreetName?: string;
  cityName?: string;
  postalZone?: string;
  countrySubentity?: string;
  countryCode?: string;
  buildingNumber?: string;
  citySubdivisionName?: string;

  // Branch
  branchId?: string;

  // Examination meta
  type: string;
  hasWarranty: boolean;
  marketerCode?: string;
  notes?: string;

  // Vehicle
  manufacturerId?: string;
  carMarkId?: string;
  year?: number;
  color?: string;
  vin?: string;
  hasPlate: boolean;
  plateLetters?: string;
  plateNumbers?: string;
  mileage?: number;
  mileageUnit: string;
  transmission?: string;

  // Services
  items?: ExaminationItemRequest[];

  // Workflow
  startAfterSave?: boolean;
}
