import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { SensorIssuesForm } from '../sensor-issues-form/sensor-issues-form';

export interface SensorIssue {
  id: number;
  code: string | number;
  nameAr: string;
  nameEn: string;
}

@Component({
  selector: 'app-sensor-issues-list',
  templateUrl: './sensor-issues-list.html',
  standalone:false,
  styleUrl: './sensor-issues-list.css',
})
export class SensorIssuesList {
  items: SensorIssue[] = [];
  searchTerm = '';

  pagingConfig = {
    id: 'sensorIssues',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private readonly api: ApiService,
    private readonly modal: NgbModal,
    private readonly toastr: ToastrService,
    public readonly authService: AuthService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.post<any>('SensorIssues/pagination',this.pagingConfig).subscribe({
      next: (res) => {
        this.items = res.items ?? [];
        this.pagingConfig.totalItems = res.totalItems ?? 0;
      },
      error: (e: any) => {
        this.toastr.error(e?.message ?? this.translate.instant('SERVER.ERROR'));
      }
    });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    if (!this.searchTerm?.trim()) {
      this.load();
      return;
    }

    const term = this.searchTerm.trim().toLowerCase();
    this.items = (this.items ?? []).filter(x =>
      String(x.code ?? '').toLowerCase().includes(term) ||
      String(x.nameAr ?? '').toLowerCase().includes(term) ||
      String(x.nameEn ?? '').toLowerCase().includes(term)
    );
    this.pagingConfig.totalItems = this.items.length;
  }

  openAdd(): void {
    const ref = this.modal.open(SensorIssuesForm, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SENSOR_ISSUES.FORM.TITLE_ADD');

    ref.result.then((saved) => {
      if (saved) {
        this.toastr.success(this.translate.instant('COMMON.TOAST.CREATED'));
        this.load();
      }
    }).catch(() => {});
  }

  openEdit(item: SensorIssue): void {
    const ref = this.modal.open(SensorIssuesForm, { size: 'lg', backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SENSOR_ISSUES.FORM.TITLE_EDIT');
    ref.componentInstance.model = { ...item };

    ref.result.then((saved) => {
      if (saved) {
        this.toastr.success(this.translate.instant('COMMON.TOAST.UPDATED'));
        this.load();
      }
    }).catch(() => {});
  }

  confirmDelete(item: SensorIssue): void {
    const ok = confirm(this.translate.instant('CONFIRM.DELETE_MESSAGE'));
    if (!ok) return;

    this.api.delete(`SensorIssues/${item.id}`).subscribe({
      next: () => {
        this.toastr.success(this.translate.instant('COMMON.TOAST.DELETED'));
        this.load();
      },
      error: (e: any) => {
        this.toastr.error(e?.message ?? this.translate.instant('SERVER.ERROR'));
      }
    });
  }
}
