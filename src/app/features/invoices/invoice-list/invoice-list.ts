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
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-invoice-list',
  standalone: false,
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit, OnDestroy {
  invoices: InvoiceDto[] = [];
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
    this.loadInvoices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInvoices(): void {
    this.api
      .post<PaginatedResponse<InvoiceDto>>('Invoices/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.invoices = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  openDetails(invoice: InvoiceDto): void {
    this.router.navigate(['/features/invoices', invoice.id]);
  }

  search(): void {
    this.pagingConfig.currentPage = 1;
    this.loadInvoices();
  }

  deleteInvoice(invoice: InvoiceDto): void {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result
      .then(() => {
        this.api.delete(`Invoices/${invoice.id}`)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'));
              this.loadInvoices();
            },
            error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED')),
          });
      })
      .catch(() => {});
  }
}
