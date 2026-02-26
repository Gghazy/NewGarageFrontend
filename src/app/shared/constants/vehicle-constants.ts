export const SAUDI_PLATE_LETTERS = [
  'أ','ب','ت','ث','ج','ح','خ','د','ذ','ر',
  'ز','س','ش','ص','ط','ع','غ','ف','ق','ك',
  'ل','م','ن','هـ','و','ي'
];

export const TRANSMISSION_OPTIONS = [
  { value: 'Automatic',     labelAr: 'أوتوماتيك',      labelEn: 'Automatic' },
  { value: 'Manual',        labelAr: 'يدوي',            labelEn: 'Manual' },
  { value: 'SemiAutomatic', labelAr: 'نصف أوتوماتيك',  labelEn: 'Semi-Automatic' },
  { value: 'CVT',           labelAr: 'CVT',             labelEn: 'CVT' },
] as const;

export const EXAMINATION_TYPES = [
  { value: 'Regular',     labelAr: 'فحص عادي',        labelEn: 'Regular' },
  { value: 'Warranty',    labelAr: 'فحص ضمان',        labelEn: 'Warranty' },
  { value: 'PrePurchase', labelAr: 'فحص ما قبل الشراء', labelEn: 'Pre-Purchase' },
] as const;

export interface VehicleFormData {
  branchId?: string;
  manufacturerId?: string;
  carMarkId?: string;
  type: string;
  hasPlate: boolean;
  plateLetters: string;
  plateNumbers: string;
  mileage?: number;
  mileageUnit: string;
  year?: number;
  color: string;
  transmission?: string;
  vin: string;
  marketerCode: string;
  hasWarranty: boolean;
  notes: string;
}

export interface ClientFormOutput {
  id?: string;
  type: string;
  data: ClientFormData;
}

export const PAYMENT_METHODS = [
  { value: 'Cash',         labelAr: 'نقدي',        labelEn: 'Cash' },
  { value: 'Card',         labelAr: 'بطاقة',       labelEn: 'Card' },
  { value: 'BankTransfer', labelAr: 'تحويل بنكي',  labelEn: 'Bank Transfer' },
  { value: 'Cheque',       labelAr: 'شيك',         labelEn: 'Cheque' },
] as const;

export interface ClientFormData {
  clientNameAr?: string;
  clientNameEn?: string;
  clientPhone?: string;
  email?: string;
  clientResourceId?: string;
  individualAddress?: string;
  taxNumber?: string;
  commercialRegister?: string;
  streetName?: string;
  additionalStreetName?: string;
  cityName?: string;
  postalZone?: string;
  countrySubentity?: string;
  countryCode?: string;
  buildingNumber?: string;
  citySubdivisionName?: string;
  clientType?: string;
}
