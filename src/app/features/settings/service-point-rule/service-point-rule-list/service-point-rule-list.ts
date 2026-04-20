import { Component, computed, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ServicePointRuleDto } from 'src/app/shared/Models/servicePointRule/service-point-rule-dto';
import { ServicePointRuleSearch } from 'src/app/shared/Models/servicePointRule/service-point-rule-search';
import { ServicePointRuleForm } from '../service-point-rule-form/service-point-rule-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';

@Component({
  selector: 'app-service-point-rule-list',
  standalone: false,
  templateUrl: './service-point-rule-list.html',
  styleUrl: './service-point-rule-list.css',
})
export class ServicePointRuleList implements OnInit, OnDestroy {
  readonly isAr = computed(() => this.lang.lang() === 'ar');
  rules: ServicePointRuleDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: ServicePointRuleSearch = {
    search: {
      itemsPerPage: 10,
      currentPage: 1,
      textSearch: '',
      sort: 'createdAtUtc',
      desc: true,
      totalItems: 0
    },
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
    this.loadRules();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRules() {
    this.loading = true;
    this.apiService.post<any>('ServicePointRules/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.rules = res.data.items;
          this.pagingConfig.search.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Failed to load point rules', 'Error');
          this.loading = false;
        }
      });
  }

  openAdd() {
    const ref = this.modal.open(ServicePointRuleForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('SERVICE_POINT_RULE.ADD');
    ref.result.then(() => this.loadRules()).catch(() => { });
  }

  openEdit(rule: ServicePointRuleDto) {
    const ref = this.modal.open(ServicePointRuleForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.rule = rule;
    ref.componentInstance.ruleId = rule.id;
    ref.result.then(() => this.loadRules()).catch(() => { });
  }

  deleteRule(rule: ServicePointRuleDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`ServicePointRules/${rule.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadRules();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.search.currentPage = 1;
    this.loadRules();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString();
  }
}
