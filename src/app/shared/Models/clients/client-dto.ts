export interface ClientDto {
  id?: number;
  type: 'individual' | 'company';
  nameEn: string;
  nameAr: string;
  companyNameAr?: string;
  companyNameEn?: string;
  commercialRegistrationNumber?: string;
  taxNumber?: string;
  email?: string;
  phone?: string;
  mobileNumber?: string;
  address?: string;
  streetName?: string;
  additionalStreetName?: string;
  regionName?: string;
  districtAr?: string;
  districtEn?: string;
  buildingNumber?: string;
  countryCode?: string;
  leadingNumber?: string;
  source?: string;
  isActive: boolean;
}
