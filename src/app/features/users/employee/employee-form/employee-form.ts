import { Component, computed, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { EmployeeDto } from 'src/app/shared/Models/employees/employee-dto';
import { EmployeeRequest } from 'src/app/shared/Models/employees/employee-request';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';
import { RoleDto } from 'src/app/shared/Models/roles/role-dto';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.html',
  styleUrl: './employee-form.css',
})
export class EmployeeForm {

  readonly isAr = computed(() => this.lang.lang() === 'ar');

  @Input() title = 'Add Employee';
  @Input() employee?: EmployeeDto;

  roles: RoleDto[] = [];
  branches: LookupDto[] = [];

  loading = false;

  form = this.fb.group({
    id: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', Validators.required],
    branchId: ['', Validators.required],
    roleId: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
     public lang: LanguageService
  ) { }

  ngOnInit(): void {

    debugger

    if (this.employee) {
      this.form.patchValue({
        id: this.employee.id,
        nameAr: this.employee.nameAr,
        nameEn: this.employee.nameEn,
        phoneNumber: this.employee.phoneNumber,
        email: this.employee.email,
        branchId: this.employee.branchId,
        roleId: this.employee.roleId,
      });
    }

    this.getRoles();
    this.getBranches();
  }
  getRoles() {
    this.apiService.get<RoleDto[]>('Roles').subscribe({
      next: (data) => {
        this.roles = data;
      },
      error: (err) => {
        console.error('Error loading roles', err);
      }
    });
  }
  getBranches() {
    this.apiService.get<LookupDto[]>('Branches').subscribe({
      next: (data) => {
        this.branches = data;
      },
      error: (err) => {
        console.error('Error loading branches', err);
      }
    });
  }



  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const value = this.form.value as EmployeeRequest;
    debugger
    if (value.id) {
      this.update(value);
    } else {
      this.add(value);
    }

  }

  add(request: EmployeeRequest) {
    this.apiService.post('Employees', request).subscribe(() => {
      this.activeModal.close(request);
    });
  }
  update(request: EmployeeRequest) {
    this.apiService.put(`Employees/${request.id}`, request).subscribe((res: any) => {

      this.toastr.success(res.message as string, 'Success');
      this.activeModal.close(request);
    });
  }

  isInvalid(controlName: string): boolean {
  const c = this.form.get(controlName);
  return !!c && c.invalid && (c.touched || c.dirty);
}
}
