export interface ServiceDiscountRequest {
    id?: string;
    serviceId: string;
    discountPercent: number | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
}
