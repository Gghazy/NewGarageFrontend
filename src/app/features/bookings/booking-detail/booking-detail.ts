import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { BookingDto, BookingHistoryDto } from 'src/app/shared/Models/bookings/booking-dto';
import { BookingService } from '../booking.service';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-booking-detail',
  standalone: false,
  templateUrl: './booking-detail.html',
  styleUrl: './booking-detail.css',
})
export class BookingDetail implements OnInit, OnDestroy {
  booking?: BookingDto;
  historyItems: BookingHistoryDto[] = [];
  loading = false;
  historyLoading = false;
  actionLoading = false;

  detailsCollapsed = true;
  historyCollapsed = false;

  private bookingId!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute,
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
    this.bookingId = this.route.snapshot.paramMap.get('id')!;
    this.loadBooking();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBooking(): void {
    this.loading = true;
    this.bookingService.getById(this.bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.booking = res.data;
          this.loading = false;
          this.loadHistory();
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/bookings']);
        },
      });
  }

  loadHistory(): void {
    this.historyLoading = true;
    this.bookingService.getHistory(this.bookingId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.historyItems = res.data ?? [];
          this.historyLoading = false;
        },
        error: () => {
          this.historyLoading = false;
        },
      });
  }

  get canConfirm(): boolean {
    return this.booking?.status === 'Pending';
  }

  get canEdit(): boolean {
    return this.booking?.status === 'Pending' || this.booking?.status === 'Confirmed';
  }

  get canConvert(): boolean {
    return this.booking?.status === 'Confirmed';
  }

  get canCancel(): boolean {
    return this.booking?.status === 'Pending' || this.booking?.status === 'Confirmed';
  }

  openEdit(): void {
    this.router.navigate(['/features/bookings', this.bookingId, 'edit']);
  }

  goToExamination(): void {
    if (this.booking?.convertedExaminationId) {
      this.router.navigate(['/features/vehicle-orders', this.booking.convertedExaminationId, 'details']);
    }
  }

  confirmAction(action: 'confirm' | 'cancel' | 'convert'): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.componentInstance.titleKey = 'COMMON.CONFIRM';
    ref.componentInstance.messageKey = `BOOKINGS.CONFIRM_${action.toUpperCase()}`;

    if (action === 'confirm') {
      ref.componentInstance.confirmKey = 'BOOKINGS.CONFIRM';
      ref.componentInstance.confirmClass = 'btn btn-success';
      ref.componentInstance.confirmIcon = 'bi bi-check-circle';
    } else if (action === 'convert') {
      ref.componentInstance.confirmKey = 'BOOKINGS.CONVERT';
      ref.componentInstance.confirmClass = 'btn btn-primary';
      ref.componentInstance.confirmIcon = 'bi bi-arrow-repeat';
    } else if (action === 'cancel') {
      ref.componentInstance.confirmKey = 'COMMON.CANCEL';
      ref.componentInstance.confirmClass = 'btn btn-danger';
      ref.componentInstance.confirmIcon = 'bi bi-x-circle';
    }

    ref.result.then(() => {
      if (this.actionLoading) return;
      this.actionLoading = true;

      let obs;
      switch (action) {
        case 'confirm': obs = this.bookingService.confirm(this.bookingId); break;
        case 'cancel': obs = this.bookingService.cancel(this.bookingId); break;
        case 'convert': obs = this.bookingService.convert(this.bookingId); break;
      }

      obs.pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.actionLoading = false;
          this.toastr.success(this.translate.instant(`BOOKINGS.${action.toUpperCase()}_SUCCESS`));
          if (action === 'convert' && res?.data) {
            this.router.navigate(['/features/vehicle-orders', res.data, 'details']);
          } else {
            this.loadBooking();
          }
        },
        error: (err: any) => {
          this.actionLoading = false;
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

  getActionIcon(action: string): string {
    const icons: Record<string, string> = {
      Created: 'bi-plus-circle-fill',
      Updated: 'bi-pencil-fill',
      Confirmed: 'bi-check-circle-fill',
      Cancelled: 'bi-x-circle-fill',
      Converted: 'bi-arrow-repeat',
      Deleted: 'bi-trash-fill',
    };
    return icons[action] ?? 'bi-clock-history';
  }

  getActionColor(action: string): string {
    const colors: Record<string, string> = {
      Created: '#22c55e',
      Updated: '#3b82f6',
      Confirmed: '#8b5cf6',
      Cancelled: '#ef4444',
      Converted: '#10b981',
      Deleted: '#ef4444',
    };
    return colors[action] ?? '#64748b';
  }

  getPerformerName(item: BookingHistoryDto): string {
    if (this.isAr) {
      return item.performedByNameAr || item.performedByNameEn || '';
    }
    return item.performedByNameEn || item.performedByNameAr || '';
  }

  goBack(): void {
    this.router.navigate(['/features/bookings']);
  }
}
