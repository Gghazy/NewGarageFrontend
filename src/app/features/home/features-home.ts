import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, map } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ChartData, ChartOptions } from 'chart.js';
import { ApiService } from 'src/app/core/services/custom.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { DashboardFilter } from './dashboard-filter/dashboard-filter';

@Component({
  selector: 'app-features-home',
  templateUrl: './features-home.html',
  standalone: false,
})
export class FeaturesHome implements OnInit, OnDestroy {
  loading = true;

  examsPending = 0;
  examsInProgress = 0;
  examsCompleted = 0;

  netRevenue = 0;
  totalDiscounts = 0;
  refundCount = 0;
  refundAmount = 0;

  canSeeExams = false;
  canSeeRevenue = false;

  branches: { id: string; nameAr: string; nameEn: string }[] = [];

  // Service usage chart
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  private filter: DashboardFilter = {
    dateFrom: new Date().toISOString().slice(0, 10),
    dateTo: new Date().toISOString().slice(0, 10),
    branchId: null,
  };
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.canSeeExams = this.auth.hasPermission('dashboard.examinations');
    this.canSeeRevenue = this.auth.hasPermission('dashboard.revenue');

    this.api.get<ApiResponse<any[]>>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => this.branches = res.data ?? [],
      });

    this.loadData();
  }

  onFilterChange(f: DashboardFilter): void {
    this.filter = f;
    this.loadData();
  }

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;
    const extract = (res: any) => res?.data ?? res;
    const qs = this.buildQueryString();

    const calls: Record<string, any> = {};

    if (this.canSeeExams) {
      calls['exams'] = this.api.get<any>('Examinations/count' + qs).pipe(
        map(extract), catchError(() => of({ pending: 0, inProgress: 0, completed: 0 }))
      );
      calls['serviceUsage'] = this.api.get<any>('Examinations/service-usage' + qs).pipe(
        map(extract), catchError((err) => { console.warn('service-usage API failed:', err); return of([]); })
      );
    }
    if (this.canSeeRevenue)
      calls['revenue'] = this.api.get<any>('Invoices/revenue' + qs).pipe(
        map(extract), catchError(() => of({ netRevenue: 0, totalDiscounts: 0, refundCount: 0, refundAmount: 0 }))
      );

    if (Object.keys(calls).length === 0) {
      this.loading = false;
      return;
    }

    forkJoin(calls)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any) => {
          if (results.exams != null) {
            this.examsPending = results.exams.pending ?? 0;
            this.examsInProgress = results.exams.inProgress ?? 0;
            this.examsCompleted = results.exams.completed ?? 0;
          }
          if (results.serviceUsage) this.buildBarChart(results.serviceUsage);
          if (results.revenue != null) {
            this.netRevenue = results.revenue.netRevenue ?? 0;
            this.totalDiscounts = results.revenue.totalDiscounts ?? 0;
            this.refundCount = results.revenue.refundCount ?? 0;
            this.refundAmount = results.revenue.refundAmount ?? 0;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
  }

  private buildQueryString(): string {
    const params: string[] = [];
    if (this.filter.dateFrom) params.push(`from=${this.filter.dateFrom}`);
    if (this.filter.dateTo) params.push(`to=${this.filter.dateTo}`);
    if (this.filter.branchId) params.push(`branchId=${this.filter.branchId}`);
    return params.length > 0 ? '?' + params.join('&') : '';
  }

  private buildBarChart(services: { nameAr: string; nameEn: string; count: number }[]): void {
    const labels = services.map(s => this.isAr ? s.nameAr : s.nameEn);
    const counts = services.map(s => s.count);

    const colors = [
      '#1e3a5f', '#0f4c75', '#2d6a9f', '#64748b',
      '#0284c7', '#0c4a6e', '#94a3b8', '#374151',
      '#1e3a5f', '#0f4c75', '#2d6a9f', '#64748b',
    ];

    this.barChartData = {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, counts.length),
          borderRadius: 4,
        },
      ],
    };
  }
}
