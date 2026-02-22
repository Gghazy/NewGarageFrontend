import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupDto } from '../../Models/lookup-dto';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from '../../Models/search-criteria';
import { LookupConfig } from '../../Models/lookup-config';
import { LookupForm } from '../lookup-form/lookup-form';
import { ConfirmDeleteModal } from '../confirm-delete-modal/confirm-delete-modal';
import { PageSizeComponent } from '../page-size/page-size.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResponse } from '../../Models/api-response';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-lookup-list',
  standalone: false,
  templateUrl: './lookup-list.html',
  styleUrl: './lookup-list.css',
})
export class LookupList implements OnInit, OnDestroy {
  @Input({ required: true }) config!: LookupConfig;

  items: LookupDto[] = [];
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
    private apiService: ApiService,
    private modal: NgbModal,
    private translate: TranslateService,
    private toastr: ToastrService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;

    this.apiService.post<PaginatedResponse<LookupDto>>(`${this.config.apiBase}/pagination`, this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.items = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('[LookupList] Failed to load items:', err);
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openAdd() {
    const ref = this.modal.open(LookupForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.config = this.config;
    ref.componentInstance.title = this.translate.instant(this.config.addTitleKey);

    ref.result.then(() => this.load()).catch(() => { });
  }

  openEdit(row: LookupDto) {
    const ref = this.modal.open(LookupForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.config = this.config;
    ref.componentInstance.title = this.translate.instant(this.config.editTitleKey);
    ref.componentInstance.initial = { id: row.id, nameAr: row.nameAr, nameEn: row.nameEn };

    ref.result.then(() => this.load()).catch(() => { });
  }

  openDelete(row: LookupDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`${this.config.apiBase}/${row.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.load();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.load();
  }
}
