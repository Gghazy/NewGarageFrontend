import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { EmployeeDto } from 'src/app/shared/Models/employees/employee-dto';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { EmployeeForm } from '../employee-form/employee-form';

@Component({
  selector: 'app-employee-list',
  standalone: false,
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
})
export class EmployeeList implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  employees: EmployeeDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameAr',
    desc: false,
    totalItems: 0
  };

  constructor(
    public apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
    public lang: LanguageService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees() {
    this.loading = true;
    this.apiService.post<any>('Employees/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.employees = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading employees', err);
          this.toastr.error('Failed to load employees', 'Error');
          this.loading = false;
        }
      });
  }

  openAddEmployee() {
    const ref = this.modal.open(EmployeeForm, { centered: true, backdrop: 'static', size: 'lg', windowClass: 'employee-modal' });
    ref.componentInstance.title = this.translate.instant('EMPLOYEES.ADD');
    ref.result.then(() => this.loadEmployees()).catch(() => { });
  }

  openEditEmployee(employee: EmployeeDto) {
    const ref = this.modal.open(EmployeeForm, { centered: true, backdrop: 'static', size: 'lg', windowClass: 'employee-modal' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.employee = employee;
    ref.result.then(() => this.loadEmployees()).catch(() => { });
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.loadEmployees();
  }
}
