import { Component, computed, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
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
export class EmployeeForm implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');

  @Input() title = 'Add Employee';
  @Input() employee?: EmployeeDto;

  roles: RoleDto[] = [];
  branches: LookupDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  form = this.fb.group({
    id: [''],
    nameAr: ['', Validators.required],
    nameEn: ['', Validators.required],
    phoneNumber: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    branchIds: [[] as string[], Validators.required],
    roleId: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private formService: FormService,
    public lang: LanguageService
  ) { }

  ngOnInit(): void {
    if (this.employee) {
      this.form.patchValue({
        id: this.employee.id,
        nameAr: this.employee.nameAr,
        nameEn: this.employee.nameEn,
        phoneNumber: this.employee.phoneNumber,
        email: this.employee.email,
        branchIds: this.employee.branches?.map(b => b.branchId) ?? [],
        roleId: this.employee.roleId,
      });
    }
    this.getRoles();
    this.getBranches();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRoles() {
    this.apiService.get<ApiResponse<RoleDto[]>>('Roles')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.roles = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load roles'), 'Error'); }
      });
  }

  getBranches() {
    // BranchesController uses Success() -> { data: [...] }
    this.apiService.get<ApiResponse<LookupDto[]>>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.branches = res.data; },
        error: (err) => { this.toastr.error(this.formService.extractError(err, 'Failed to load branches'), 'Error'); }
      });
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as EmployeeRequest;
    const isEdit = !!value.id;
    const apiCall = isEdit
      ? this.apiService.put(`Employees/${value.id}`, value)
      : this.apiService.post('Employees', value);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)) as any, {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Employee updated successfully' : 'Employee created successfully',
      errorFallback: isEdit ? 'Failed to update employee' : 'Failed to create employee',
      setLoading: (v) => (this.loading = v),
      closeValue: value,
    });
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
