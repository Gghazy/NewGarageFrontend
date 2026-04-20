import { SearchCriteria } from '../search-criteria';

export interface ServiceDiscountSearch {
    search: SearchCriteria;
    serviceId?: string;
    isActive?: boolean;
}
