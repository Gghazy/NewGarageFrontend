export interface PaymentDto {
  id: string;
  amount: number;
  currency: string;
  method: string;
  type: string;
  notes?: string;
  createdAtUtc: string;
}

export interface ExaminationItemDto {
  id: string;
  serviceId: string;
  serviceNameAr: string;
  serviceNameEn: string;
  price: number;
  currency: string;
  status: string;
  notes?: string;
}

export interface ExaminationDto {
  id: string;
  invoiceNumber?: string;
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

  // Financials
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
  currency: string;
  totalPaid: number;
  totalRefunded: number;
  balance: number;

  // Items
  items: ExaminationItemDto[];

  // Payments
  payments: PaymentDto[];

  createdAtUtc: string;
}
