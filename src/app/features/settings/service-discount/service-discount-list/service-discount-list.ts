import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ServiceDiscountDto } from 'src/app/shared/Models/serviceDiscount/service-discount-dto';
import { ServiceDiscountSearch } from 'src/app/shared/Models/serviceDiscount/service-discount-search';
import { ServiceDiscountForm } from '../service-discount-form/service-discount-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-service-discount-list',
  standalone: false,
  templateUrl: './service-discount-list.html',
  styleUrl: './service-discount-list.css',
})
export class ServiceDiscountList implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  serviceDiscounts: ServiceDiscountDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: ServiceDiscountSearch = {
    search: {
      itemsPerPage: 10,
      currentPage: 1,
      textSearch: '',
      sort: 'createdAtUtc',
      desc: true,
      totalItems: 0
    },
    serviceId: undefined,
    isActive: undefined
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
    this.loadDiscounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDiscounts() {
    this.loading = true;
    this.apiService.post<any>('ServiceDiscounts/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.serviceDiscounts = res.data.items;
          this.pagingConfig.search.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading service discounts', err);
          this.toastr.error('Failed to load service discounts', 'Error');
          this.loading = false;
        }
      });
  }

  openAddDiscount() {
    const ref = this.modal.open(ServiceDiscountForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SERVICE_DISCOUNT.ADD');
    ref.result.then(() => this.loadDiscounts()).catch(() => { });
  }

  openEditDiscount(discount: ServiceDiscountDto) {
    const ref = this.modal.open(ServiceDiscountForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.discount = discount;
    ref.componentInstance.discountId = discount.id;
    ref.result.then(() => this.loadDiscounts()).catch(() => { });
  }

  deleteDiscount(discount: ServiceDiscountDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`ServiceDiscounts/${discount.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadDiscounts();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.search.currentPage = 1;
    this.loadDiscounts();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }
}
