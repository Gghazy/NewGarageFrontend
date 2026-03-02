export interface ClientDto {
  id?: string;
  typeAr: string;
  typeEn: string;
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  taxNumber?: string;
  commercialRegister?: string;
  email: string;
  sourceNameEn: string;
  sourceNameAr: string;
  sourceId?: string;
  // Individual address
  address?: string;
  // Company address
  streetName?: string;
  additionalStreetName?: string;
  cityName?: string;
  postalZone?: string;
  countrySubentity?: string;
  countryCode?: string;
  buildingNumber?: string;
  citySubdivisionName?: string;
  // Stats
  examinationCount: number;
  totalRevenue: number;
}
