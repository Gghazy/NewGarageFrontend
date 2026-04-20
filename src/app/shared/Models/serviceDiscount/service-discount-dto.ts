export interface ServiceDiscountDto {
    id: string;
    serviceId: string;
    serviceNameAr: string;
    serviceNameEn: string;
    discountPercent: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}
