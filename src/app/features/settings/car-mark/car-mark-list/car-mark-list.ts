import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { CarMarkDto } from 'src/app/shared/Models/car-mark/car-mark-dto';
import { CarMarkForm } from '../car-mark-form/car-mark-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';

@Component({
  selector: 'app-car-mark-list',
  standalone: false,
  templateUrl: './car-mark-list.html',
  styleUrl: './car-mark-list.css',
})
export class CarMarkList implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  items: CarMarkDto[] = [];
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
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
    public lang: LanguageService
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
    this.apiService.post<any>('CarMarkes/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.items = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('[CarMarkList] Failed to load:', err);
          this.loading = false;
        }
      });
  }

  openAdd(): void {
    const ref = this.modal.open(CarMarkForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('CAR_MARKS.ADD');
    ref.result.then(() => this.load()).catch(() => {});
  }

  openEdit(row: CarMarkDto): void {
    const ref = this.modal.open(CarMarkForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.carMark = row;
    ref.componentInstance.carMarkId = row.id;
    ref.result.then(() => this.load()).catch(() => {});
  }

  openDelete(row: CarMarkDto): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`CarMarkes/${row.id}`)
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

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.load();
  }
}
