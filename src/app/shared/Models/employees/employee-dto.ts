export interface EmployeeBranchDto {
    branchId: string;
    branchNameAr: string;
    branchNameEn: string;
}

export interface EmployeeDto {
    id: string;
    userId: string;
    nameAr: string;
    nameEn: string;
    roleId: string;
    roleName: string;
    phoneNumber: string;
    branches: EmployeeBranchDto[];
    isActive: boolean;
    email: string;
}
