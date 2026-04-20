import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';

export interface StageCountDto {
  stage: string;
  count: number;
}

export interface EmployeeExaminationReportDto {
  employeeId: string;
  userId: string;
  nameAr: string;
  nameEn: string;
  examinationCount: number;
  totalStageActions: number;
  stageCounts: StageCountDto[];
}

export interface MetricRow {
  labelKey: string;
  valueA: number;
  valueB: number;
  diff: number;
  changePercent: number | null;
}

@Component({
  selector: 'app-employee-comparison-report',
  standalone: false,
  templateUrl: './employee-comparison-report.html',
  styleUrl: './employee-comparison-report.css',
})
export class EmployeeComparisonReport implements OnInit, OnDestroy {
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  allEmployees: { id: string; nameAr: string; nameEn: string }[] = [];

  employeeA: EmployeeExaminationReportDto | null = null;
  employeeB: EmployeeExaminationReportDto | null = null;
  metricRows: MetricRow[] = [];

  fromA = '';
  toA = '';
  fromB = '';
  toB = '';
  branchId: string | null = null;
  employeeAId: string | null = null;
  employeeBId: string | null = null;

  readonly allStages = [
    'SensorStageSaved',
    'DashboardIndicatorsStageSaved',
    'InteriorDecorStageSaved',
    'InteriorBodyStageSaved',
    'ExteriorBodyStageSaved',
    'TireStageSaved',
    'AccessoryStageSaved',
    'MechanicalStageSaved',
    'RoadTestStageSaved',
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  ngOnInit(): void {
    this.loadBranches();
    this.loadParticipatingEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private get isUnrestrictedRole(): boolean {
    return this.authService.hasRole('Admin') || this.authService.hasRole('Manager');
  }

  private loadBranches(): void {
    const employeeBranches = this.authService.getBranches();
    this.api.get<ApiResponse<any[]>>('Branches')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const all = res.data ?? [];
          this.branches = (!this.isUnrestrictedRole && employeeBranches.length > 0)
            ? all.filter((b: any) => employeeBranches.includes(b.id))
            : all;
        },
      });
  }

  private loadParticipatingEmployees(): void {
    this.api.get<ApiResponse<EmployeeExaminationReportDto[]>>('Examinations/employee-report')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const items = res.data ?? [];
          this.allEmployees = items
            .map(e => ({ id: e.employeeId, nameAr: e.nameAr, nameEn: e.nameEn }))
            .sort((a, b) => (this.isAr ? a.nameAr.localeCompare(b.nameAr) : a.nameEn.localeCompare(b.nameEn)));
        },
      });
  }

  get canSearch(): boolean {
    return !!this.fromA && !!this.toA && !!this.fromB && !!this.toB
      && !!this.employeeAId && !!this.employeeBId;
  }

  search(): void {
    if (!this.fromA || !this.toA || !this.fromB || !this.toB) {
      this.toastr.warning(this.translate.instant('EMPLOYEE_COMPARISON.SELECT_PERIODS'));
      return;
    }
    if (!this.employeeAId || !this.employeeBId) {
      this.toastr.warning(this.translate.instant('EMPLOYEE_COMPARISON.SELECT_EMPLOYEES'));
      return;
    }

    const paramsA: Record<string, string> = { from: this.fromA, to: this.toA };
    const paramsB: Record<string, string> = { from: this.fromB, to: this.toB };
    if (this.branchId) {
      paramsA['branchId'] = this.branchId;
      paramsB['branchId'] = this.branchId;
    }

    forkJoin({
      a: this.api.get<ApiResponse<EmployeeExaminationReportDto[]>>('Examinations/employee-report', { params: paramsA }),
      b: this.api.get<ApiResponse<EmployeeExaminationReportDto[]>>('Examinations/employee-report', { params: paramsB }),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ a, b }) => {
          const listA = a.data ?? [];
          const listB = b.data ?? [];
          this.employeeA = listA.find(e => e.employeeId === this.employeeAId) ?? this.emptyRow(this.employeeAId!);
          this.employeeB = listB.find(e => e.employeeId === this.employeeBId) ?? this.emptyRow(this.employeeBId!);
          this.buildMetricRows();
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  private buildMetricRows(): void {
    if (!this.employeeA || !this.employeeB) { this.metricRows = []; return; }

    const rows: MetricRow[] = [
      this.buildRow('EMPLOYEE_COMPARISON.EXAMS', this.employeeA.examinationCount, this.employeeB.examinationCount),
      this.buildRow('EMPLOYEE_COMPARISON.ACTIONS', this.employeeA.totalStageActions, this.employeeB.totalStageActions),
    ];

    for (const stage of this.allStages) {
      const a = this.getStageCount(this.employeeA, stage);
      const b = this.getStageCount(this.employeeB, stage);
      rows.push(this.buildRow('EMPLOYEE_REPORT.STAGES.' + stage, a, b));
    }

    this.metricRows = rows;
  }

  private buildRow(labelKey: string, valueA: number, valueB: number): MetricRow {
    const diff = valueB - valueA;
    const changePercent = valueA !== 0 ? (diff / valueA) * 100 : null;
    return { labelKey, valueA, valueB, diff, changePercent };
  }

  private emptyRow(employeeId: string): EmployeeExaminationReportDto {
    const emp = this.allEmployees.find(e => e.id === employeeId);
    return {
      employeeId,
      userId: '',
      nameAr: emp?.nameAr ?? '',
      nameEn: emp?.nameEn ?? '',
      examinationCount: 0,
      totalStageActions: 0,
      stageCounts: [],
    };
  }

  private getStageCount(emp: EmployeeExaminationReportDto, stage: string): number {
    return emp.stageCounts?.find(s => s.stage === stage)?.count ?? 0;
  }

  employeeName(emp: EmployeeExaminationReportDto | null): string {
    if (!emp) return '';
    return this.isAr ? emp.nameAr : emp.nameEn;
  }

  exportToExcel(): void {
    if (!this.employeeA || !this.employeeB) return;
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      t('EMPLOYEE_COMPARISON.METRIC'),
      this.employeeName(this.employeeA) + ' (' + this.fromA + ' → ' + this.toA + ')',
      this.employeeName(this.employeeB) + ' (' + this.fromB + ' → ' + this.toB + ')',
      t('EMPLOYEE_COMPARISON.DIFFERENCE'),
      '%',
    ];

    const rows = this.metricRows.map(r => [
      t(r.labelKey),
      r.valueA.toString(),
      r.valueB.toString(),
      r.diff.toString(),
      r.changePercent !== null ? r.changePercent.toFixed(1) + '%' : '-',
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
