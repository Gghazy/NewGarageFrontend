import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ServicePriceDto } from 'src/app/shared/Models/servicePrice/service-price-dto';
import { ServicePriceSearch } from 'src/app/shared/Models/service-price-search';
import { ServicePriceForm } from '../service-price-form/service-price-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-service-price-list',
  standalone: false,
  templateUrl: './service-price-list.html',
  styleUrl: './service-price-list.css',
})
export class ServicePriceList implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  servicePrices: ServicePriceDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: ServicePriceSearch = {
    search: {
      itemsPerPage: 10,
      currentPage: 1,
      textSearch: '',
      sort: 'nameAr',
      desc: false,
      totalItems: 0
    },
    markId: undefined,
    serviceId: undefined
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
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices() {
    this.loading = true;
    this.apiService.post<any>('ServicePrices/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.servicePrices = res.data.items;
          this.pagingConfig.search.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading service prices', err);
          this.toastr.error('Failed to load service prices', 'Error');
          this.loading = false;
        }
      });
  }

  openAddServicePrice() {
    const ref = this.modal.open(ServicePriceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SERVICE_PRICE.ADD');
    ref.result.then(() => this.loadServices()).catch(() => { });
  }

  openEditServicePrice(service: ServicePriceDto) {
    const ref = this.modal.open(ServicePriceForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.service = service;
    ref.componentInstance.serviceId = (service as any).id;
    ref.result.then(() => this.loadServices()).catch(() => { });
  }

  deleteServicePrice(service: ServicePriceDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`ServicePrices/${(service as any).id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadServices();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.search.currentPage = 1;
    this.loadServices();
  }
}
