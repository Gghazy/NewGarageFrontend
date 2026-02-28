export interface EmployeeRequest {
    id?: string;
    userId: string;
    nameAr: string;
    nameEn: string;
    phoneNumber: string;
    email: string;
    branchIds: string[];
    roleId: string;
}
