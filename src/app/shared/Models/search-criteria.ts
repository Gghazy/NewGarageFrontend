export interface SearchCriteria {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    textSearch?: string;
    sort?: string;
    desc: boolean;
    dateFrom?: string;
    dateTo?: string;
    branchId?: string | null;
}
