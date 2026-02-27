import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { PaginatedResponse } from 'src/app/shared/Models/api-response';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-vehicle-order-list',
  standalone: false,
  templateUrl: './vehicle-order-list.html',
  styleUrl: './vehicle-order-list.css',
})
export class VehicleOrderList implements OnInit, OnDestroy {
  orders: ExaminationDto[] = [];
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'createdAtUtc',
    desc: true,
    totalItems: 0,
  };

  constructor(
    private api: ApiService,
    private router: Router,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    this.api
      .post<PaginatedResponse<ExaminationDto>>('Examinations/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.orders = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  openNew(): void {
    this.router.navigate(['/features/vehicle-orders/new']);
  }

  openEdit(order: ExaminationDto): void {
    this.router.navigate(['/features/vehicle-orders', order.id]);
  }

  openWorkflow(order: ExaminationDto): void {
    this.router.navigate(['/features/vehicle-orders', order.id, 'workflow']);
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.loadOrders();
  }

  deleteOrder(order: ExaminationDto): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result
      .then(() => {
        this.api.delete(`Examinations/${order.id}`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'));
              this.loadOrders();
            },
            error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED')),
          });
      })
      .catch(() => {});
  }

  getPlateDisplay(order: ExaminationDto): string {
    const letters = order.plateLetters ?? '';
    const numbers = order.plateNumbers ?? '';
    if (!letters && !numbers) return '—';
    return `${letters} ${numbers}`.trim();
  }
}
