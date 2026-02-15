import { SearchCriteria } from "./search-criteria";

export interface ServicePriceSearch {
    search:SearchCriteria;
    markId?:number;
    serviceId?:number;
}
