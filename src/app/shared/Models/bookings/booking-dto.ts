export interface BookingHistoryDto {
  id: string;
  action: string;
  details?: string;
  performedById?: string;
  performedByNameAr?: string;
  performedByNameEn?: string;
  createdAtUtc: string;
}

export interface BookingDto {
  id: string;
  clientId: string;
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;
  manufacturerId: string;
  manufacturerNameAr: string;
  manufacturerNameEn: string;
  carMarkId: string;
  carMarkNameAr: string;
  carMarkNameEn: string;
  year?: number;
  transmission?: string;
  examinationDate: string;
  examinationTime: string;
  location?: string;
  notes?: string;
  status: string;
  convertedExaminationId?: string;
  createdAtUtc: string;
}
