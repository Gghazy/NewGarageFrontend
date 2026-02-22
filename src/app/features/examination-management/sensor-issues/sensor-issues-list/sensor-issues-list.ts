import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { SensorIssuesForm } from '../sensor-issues-form/sensor-issues-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

export interface SensorIssue {
  id: number;
  code: string | number;
  nameAr: string;
  nameEn: string;
}

@Component({
  selector: 'app-sensor-issues-list',
  templateUrl: './sensor-issues-list.html',
  standalone: false,
  styleUrl: './sensor-issues-list.css',
})
export class SensorIssuesList implements OnInit, OnDestroy {
  items: SensorIssue[] = [];
  searchTerm = '';
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
    private readonly api: ApiService,
    private readonly modal: NgbModal,
    private readonly toastr: ToastrService,
    private readonly formService: FormService,
    public readonly authService: AuthService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(): void {
    this.loading = true;
    this.api.post<any>('SensorIssues/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          // Backend returns ApiResponse<QueryResult<T>> -> { data: { items, totalCount } }
          this.items = res.data?.items ?? [];
          this.pagingConfig.totalItems = res.data?.totalCount ?? 0;
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, this.translate.instant('SERVER.ERROR')));
          this.loading = false;
        }
      });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.load();
  }

  openAdd(): void {
    const ref = this.modal.open(SensorIssuesForm, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SENSOR_ISSUES.FORM.TITLE_ADD');
    ref.result.then(() => this.load()).catch(() => {});
  }

  openEdit(item: SensorIssue): void {
    const ref = this.modal.open(SensorIssuesForm, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SENSOR_ISSUES.FORM.TITLE_EDIT');
    ref.componentInstance.model = { ...item };
    ref.result.then(() => this.load()).catch(() => {});
  }

  confirmDelete(item: SensorIssue): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.api.delete(`SensorIssues/${item.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            this.toastr.success(res?.message ?? this.translate.instant('COMMON.TOAST.DELETED'), 'Success');
            this.load();
          },
          error: (err) => {
            this.toastr.error(this.formService.extractError(err, this.translate.instant('SERVER.ERROR')));
          }
        });
    }).catch(() => {});
  }
}
