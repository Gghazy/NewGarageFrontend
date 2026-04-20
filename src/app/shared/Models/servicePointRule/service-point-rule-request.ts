export interface ServicePointRuleRequest {
    id?: string;
    fromAmount: number | null;
    toAmount: number | null;
    points: number | null;
    isActive: boolean;
}
