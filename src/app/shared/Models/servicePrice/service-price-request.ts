export interface ServicePriceRequest {
    id?: string;
    markId: string | null;
    serviceId: string;
    fromYear: number | null;
    toYear: number | null;
    price: number | null;
}
