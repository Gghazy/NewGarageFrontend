import { Component, computed } from '@angular/core';
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
export class EmployeeList {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  employees: EmployeeDto[] = [];
  loading = false;

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameAr',
    desc: false,
    totalItems: 0

  }

  constructor(
    public apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
    public lang: LanguageService
  ) { }

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.loading = true;

    this.apiService.post<any>('Employees/pagination', this.pagingConfig).subscribe({
      next: (res) => {
        this.employees = res.data.items;
        this.pagingConfig.totalItems = res.data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading employees', err);
        this.loading = false;
      }
    });
  }
  openAddEmployee() {
    const ref = this.modal.open(EmployeeForm, { centered: true, backdrop: 'static', size: 'lg',windowClass: 'employee-modal' });
    ref.componentInstance.title = this.translate.instant('EMPLOYEES.ADD');

    ref.result.then((value: EmployeeDto) => {
      this.loadServices();
    }).catch(() => { });

  }
  openEditEmployee(employee: any) {
    const ref = this.modal.open(EmployeeForm, { centered: true, backdrop: 'static', size: 'lg',windowClass: 'employee-modal' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.employee = employee;

    ref.result.then((value: EmployeeDto) => {
      this.loadServices();
    }).catch(() => { });
  }
  search() {
    this.pagingConfig.currentPage = 1;
    this.loadServices();
  }
}
