import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ExaminationDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-examination-detail',
  standalone: false,
  templateUrl: './examination-detail.html',
  styleUrl: './examination-detail.css',
})
export class ExaminationDetail implements OnInit, OnDestroy {
  examination?: ExaminationDto;
  invoices: InvoiceDto[] = [];
  loading = false;
  invoicesLoading = false;
  actionLoading = false;
  allStagesCompleted = false;

  vehicleCollapsed = true;
  servicesCollapsed = true;
  invoicesCollapsed = true;
  private examinationId!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.examinationId = params.get('id')!;
        this.loadExamination();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadExamination(): void {
    this.loading = true;
    this.allStagesCompleted = false;
    this.api.get<any>(`Examinations/${this.examinationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.examination = res.data;
          this.loading = false;
          this.loadInvoices();
          if (this.examination?.status === 'InProgress') {
            this.checkCanComplete();
          }
        },
        error: () => {
          this.toastr.error(this.translate.instant('COMMON.ERROR'));
          this.router.navigate(['/features/vehicle-orders']);
        },
      });
  }

  private checkCanComplete(): void {
    this.api.get<any>(`Examinations/${this.examinationId}/can-complete`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.allStagesCompleted = !!res.data; },
        error: () => { this.allStagesCompleted = false; },
      });
  }

  loadInvoices(): void {
    this.invoicesLoading = true;
    this.api.get<any>(`Invoices/by-examination/${this.examinationId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data;
          this.invoicesLoading = false;
        },
        error: () => {
          this.invoicesLoading = false;
        },
      });
  }

  openInvoice(invoice: InvoiceDto): void {
    this.router.navigate(['/features/invoices', invoice.id]);
  }

  get canStart(): boolean {
    return this.examination?.status === 'Draft' || this.examination?.status === 'Pending';
  }

  get canOpenWorkflow(): boolean {
    return this.examination?.status === 'InProgress';
  }

  get canComplete(): boolean {
    return this.examination?.status === 'InProgress' && this.allStagesCompleted;
  }

  get canDeliver(): boolean {
    return this.examination?.status === 'Completed';
  }

  get canCancel(): boolean {
    const s = this.examination?.status;
    return !!s && !['Completed', 'Delivered', 'Cancelled'].includes(s);
  }

  get canEdit(): boolean {
    return this.examination?.status === 'Draft' || this.examination?.status === 'Pending';
  }

  get canGenerateReport(): boolean {
    return this.examination?.status === 'Delivered';
  }

  get canReopen(): boolean {
    return this.examination?.status === 'Completed' || this.examination?.status === 'Delivered';
  }

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  getPlateDisplay(): string {
    if (!this.examination) return '—';
    const letters = this.examination.plateLetters ?? '';
    const numbers = this.examination.plateNumbers ?? '';
    if (!letters && !numbers) return '—';
    return `${letters} ${numbers}`.trim();
  }

  start(): void {
    const isPending = this.examination?.status === 'Pending';
    const endpoint = isPending
      ? `Examinations/${this.examinationId}/begin-work`
      : `Examinations/${this.examinationId}/start`;
    this.confirmAndExecute(
      'VEHICLE_ORDERS.DETAIL.CONFIRM_START',
      endpoint,
      'VEHICLE_ORDERS.DETAIL.STARTED',
      { confirmKey: 'VEHICLE_ORDERS.DETAIL.START', confirmClass: 'btn btn-success', confirmIcon: 'bi bi-play-fill', titleClass: 'text-success' },
    );
  }

  complete(): void {
    this.confirmAndExecute(
      'VEHICLE_ORDERS.DETAIL.CONFIRM_COMPLETE',
      `Examinations/${this.examinationId}/complete`,
      'VEHICLE_ORDERS.DETAIL.COMPLETED',
      { confirmKey: 'VEHICLE_ORDERS.DETAIL.COMPLETE', confirmClass: 'btn btn-success', confirmIcon: 'bi bi-check-circle', titleClass: 'text-success' },
    );
  }

  deliver(): void {
    this.confirmAndExecute(
      'VEHICLE_ORDERS.DETAIL.CONFIRM_DELIVER',
      `Examinations/${this.examinationId}/deliver`,
      'VEHICLE_ORDERS.DETAIL.DELIVERED',
      { confirmKey: 'VEHICLE_ORDERS.DETAIL.DELIVER', confirmClass: 'btn btn-info text-white', confirmIcon: 'bi bi-truck', titleClass: 'text-info' },
    );
  }

  cancel(): void {
    this.confirmAndExecute(
      'VEHICLE_ORDERS.DETAIL.CONFIRM_CANCEL',
      `Examinations/${this.examinationId}/cancel`,
      'VEHICLE_ORDERS.DETAIL.CANCELLED',
      { confirmKey: 'VEHICLE_ORDERS.DETAIL.CANCEL', confirmClass: 'btn btn-danger', confirmIcon: 'bi bi-x-circle', titleClass: 'text-danger' },
    );
  }

  reopen(): void {
    this.confirmAndExecute(
      'VEHICLE_ORDERS.DETAIL.CONFIRM_REOPEN',
      `Examinations/${this.examinationId}/reopen`,
      'VEHICLE_ORDERS.DETAIL.REOPENED',
      { confirmKey: 'VEHICLE_ORDERS.DETAIL.REOPEN', confirmClass: 'btn btn-warning', confirmIcon: 'bi bi-arrow-counterclockwise', titleClass: 'text-warning' },
    );
  }

  generateReport(): void {
    if (this.actionLoading) return;
    this.actionLoading = true;

    this.api.getFile(`Examinations/${this.examinationId}/report`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          this.actionLoading = false;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `examination-report-${this.examinationId}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          this.actionLoading = false;
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        },
      });
  }

  openEdit(): void {
    this.router.navigate(['/features/vehicle-orders', this.examinationId]);
  }

  openWorkflow(): void {
    this.router.navigate(['/features/vehicle-orders', this.examinationId, 'workflow']);
  }

  goBack(): void {
    this.router.navigate(['/features/vehicle-orders']);
  }

  private confirmAndExecute(
    messageKey: string, endpoint: string, successKey: string,
    style?: { confirmKey?: string; confirmClass?: string; confirmIcon?: string; titleClass?: string },
  ): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.componentInstance.titleKey = 'COMMON.CONFIRM';
    ref.componentInstance.messageKey = messageKey;
    if (style?.confirmKey) ref.componentInstance.confirmKey = style.confirmKey;
    if (style?.confirmClass) ref.componentInstance.confirmClass = style.confirmClass;
    if (style?.confirmIcon) ref.componentInstance.confirmIcon = style.confirmIcon;
    if (style?.titleClass) ref.componentInstance.titleClass = style.titleClass;

    ref.result
      .then(() => {
        if (this.actionLoading) return;
        this.actionLoading = true;

        this.api.post<any>(endpoint, {})
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.actionLoading = false;
              this.toastr.success(this.translate.instant(successKey));
              this.loadExamination();
            },
            error: (err) => {
              this.actionLoading = false;
              this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
            },
          });
      })
      .catch(() => {});
  }
}
