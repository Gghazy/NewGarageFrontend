export interface ExaminationItemDto {
  id: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  quantity: number;
  overridePrice?: number;
  status: string;
  notes?: string;
}

export interface ExaminationDto {
  id: string;
  status: string;
  type: string;

  // Client
  clientId: string;
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;

  // Branch
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;

  // Vehicle
  vehicleId: string;
  manufacturerId: string;
  manufacturerNameAr: string;
  manufacturerNameEn: string;
  carMarkId: string;
  carMarkNameAr: string;
  carMarkNameEn: string;
  year?: number;
  color?: string;
  vin?: string;
  hasPlate: boolean;
  plateLetters?: string;
  plateNumbers?: string;
  mileage?: number;
  mileageUnit: string;
  transmission?: string;

  // Examination meta
  hasWarranty: boolean;
  hasPhotos: boolean;
  marketerCode?: string;
  notes?: string;

  // Items
  items: ExaminationItemDto[];

  createdAtUtc: string;
}
