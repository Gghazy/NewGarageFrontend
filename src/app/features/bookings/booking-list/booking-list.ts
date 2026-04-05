import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { BookingDto } from 'src/app/shared/Models/bookings/booking-dto';
import { BookingService } from '../booking.service';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-booking-list',
  standalone: false,
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingList implements OnInit, OnDestroy {
  bookings: BookingDto[] = [];
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'createdAtUtc',
    desc: true,
    totalItems: 0,
    dateFrom: undefined,
    dateTo: undefined,
    branchId: null,
    status: null,
  };

  constructor(
    private api: ApiService,
    private bookingService: BookingService,
    private router: Router,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.loadBranches();
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBranches(): void {
    this.api.get<ApiResponse<any[]>>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.branches = res.data ?? []; },
      });
  }

  load(): void {
    this.bookingService.paginate(this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.bookings = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.load();
  }

  openForm(booking?: BookingDto): void {
    if (booking) {
      this.router.navigate(['/features/bookings', booking.id, 'edit']);
    } else {
      this.router.navigate(['/features/bookings', 'new']);
    }
  }

  openDetail(booking: BookingDto): void {
    this.router.navigate(['/features/bookings', booking.id, 'detail']);
  }

  confirmAction(booking: BookingDto, action: 'confirm' | 'cancel' | 'delete' | 'convert'): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.componentInstance.titleKey = 'COMMON.CONFIRM';
    ref.componentInstance.messageKey = `BOOKINGS.CONFIRM_${action.toUpperCase()}`;

    if (action === 'convert') {
      ref.componentInstance.confirmKey = 'BOOKINGS.CONVERT';
      ref.componentInstance.confirmClass = 'btn btn-success';
      ref.componentInstance.confirmIcon = 'bi bi-arrow-repeat';
    } else if (action === 'cancel') {
      ref.componentInstance.confirmClass = 'btn btn-danger';
    }

    ref.result.then(() => {
      let obs;
      switch (action) {
        case 'confirm': obs = this.bookingService.confirm(booking.id); break;
        case 'cancel': obs = this.bookingService.cancel(booking.id); break;
        case 'delete': obs = this.bookingService.delete(booking.id); break;
        case 'convert': obs = this.bookingService.convert(booking.id); break;
      }

      obs.pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.toastr.success(this.translate.instant(`BOOKINGS.${action.toUpperCase()}_SUCCESS`));
          if (action === 'convert' && res?.data) {
            this.router.navigate(['/features/vehicle-orders', res.data, 'detail']);
          } else {
            this.load();
          }
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        },
      });
    }).catch(() => {});
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'bg-warning text-dark';
      case 'Confirmed': return 'bg-primary';
      case 'Converted': return 'bg-success';
      case 'Cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
