import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';

export interface EmployeePeriodDto {
  employeeId: string;
  userId: string;
  nameAr: string;
  nameEn: string;
  examinationCount: number;
  totalStageActions: number;
}

export interface EmployeePeriodSummaryDto {
  employees: EmployeePeriodDto[];
  totalExaminations: number;
  totalStageActions: number;
}

export interface EmployeeComparisonResponse {
  period1: EmployeePeriodSummaryDto;
  period2: EmployeePeriodSummaryDto;
}

export interface MergedEmployeeRow {
  employeeId: string;
  nameAr: string;
  nameEn: string;
  p1Exams: number;
  p1Actions: number;
  p2Exams: number;
  p2Actions: number;
  examDiff: number;
  actionDiff: number;
  examChangePercent: number | null;
}

@Component({
  selector: 'app-employee-comparison-report',
  standalone: false,
  templateUrl: './employee-comparison-report.html',
  styleUrl: './employee-comparison-report.css',
})
export class EmployeeComparisonReport implements OnInit, OnDestroy {
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  data: EmployeeComparisonResponse | null = null;
  mergedRows: MergedEmployeeRow[] = [];
  private destroy$ = new Subject<void>();

  from1 = '';
  to1 = '';
  from2 = '';
  to2 = '';
  branchId: string | null = null;
  employeeId1: string | null = null;
  employeeId2: string | null = null;

  allEmployees: { id: string; nameAr: string; nameEn: string }[] = [];

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
    this.loadEmployees();
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

  private loadEmployees(): void {
    this.api.post<any>('Employees/pagination', { itemsPerPage: 500, currentPage: 1 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const items = res.data?.items ?? [];
          this.allEmployees = items.map((e: any) => ({
            id: e.id,
            nameAr: e.nameAr || e.name,
            nameEn: e.nameEn || e.name,
          }));
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canSearch(): boolean {
    return !!this.from1 && !!this.to1 && !!this.from2 && !!this.to2;
  }

  search(): void {
    if (!this.canSearch) {
      this.toastr.warning(this.translate.instant('EMPLOYEE_COMPARISON.SELECT_PERIODS'));
      return;
    }

    this.employeeId1 = null;
    this.employeeId2 = null;

    const params: Record<string, string> = {
      from1: this.from1, to1: this.to1,
      from2: this.from2, to2: this.to2,
    };
    if (this.branchId) params['branchId'] = this.branchId;

    this.api.get<ApiResponse<EmployeeComparisonResponse>>('Examinations/employee-comparison', { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.data = res.data;
          this.buildMergedRows();
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  onEmployeeFilterChange(): void {
    this.buildMergedRows();
  }

  private buildMergedRows(): void {
    if (!this.data) { this.mergedRows = []; return; }
    const map = new Map<string, MergedEmployeeRow>();

    const p1List = this.employeeId1
      ? this.data.period1.employees.filter(e => e.employeeId === this.employeeId1)
      : this.data.period1.employees;

    const p2List = this.employeeId2
      ? this.data.period2.employees.filter(e => e.employeeId === this.employeeId2)
      : this.data.period2.employees;

    for (const e of p1List) {
      map.set(e.employeeId, {
        employeeId: e.employeeId, nameAr: e.nameAr, nameEn: e.nameEn,
        p1Exams: e.examinationCount, p1Actions: e.totalStageActions,
        p2Exams: 0, p2Actions: 0,
        examDiff: 0, actionDiff: 0, examChangePercent: null,
      });
    }

    for (const e of p2List) {
      const existing = map.get(e.employeeId);
      if (existing) {
        existing.p2Exams = e.examinationCount;
        existing.p2Actions = e.totalStageActions;
      } else {
        map.set(e.employeeId, {
          employeeId: e.employeeId, nameAr: e.nameAr, nameEn: e.nameEn,
          p1Exams: 0, p1Actions: 0,
          p2Exams: e.examinationCount, p2Actions: e.totalStageActions,
          examDiff: 0, actionDiff: 0, examChangePercent: null,
        });
      }
    }

    this.mergedRows = Array.from(map.values()).map(r => {
      r.examDiff = r.p2Exams - r.p1Exams;
      r.actionDiff = r.p2Actions - r.p1Actions;
      r.examChangePercent = r.p1Exams !== 0 ? (r.examDiff / r.p1Exams) * 100 : null;
      return r;
    }).sort((a, b) => b.examDiff - a.examDiff);
  }

  getName(row: MergedEmployeeRow): string {
    return this.isAr ? row.nameAr : row.nameEn;
  }

  get grandExamDiff(): number {
    if (!this.data) return 0;
    return this.data.period2.totalExaminations - this.data.period1.totalExaminations;
  }

  get grandActionDiff(): number {
    if (!this.data) return 0;
    return this.data.period2.totalStageActions - this.data.period1.totalStageActions;
  }

  get grandExamChangePercent(): number | null {
    if (!this.data || this.data.period1.totalExaminations === 0) return null;
    return (this.grandExamDiff / this.data.period1.totalExaminations) * 100;
  }

  exportToExcel(): void {
    if (!this.data) return;
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      t('EMPLOYEE_COMPARISON.EMPLOYEE'),
      t('EMPLOYEE_COMPARISON.PERIOD1') + ' - ' + t('EMPLOYEE_COMPARISON.EXAMS'),
      t('EMPLOYEE_COMPARISON.PERIOD1') + ' - ' + t('EMPLOYEE_COMPARISON.ACTIONS'),
      t('EMPLOYEE_COMPARISON.PERIOD2') + ' - ' + t('EMPLOYEE_COMPARISON.EXAMS'),
      t('EMPLOYEE_COMPARISON.PERIOD2') + ' - ' + t('EMPLOYEE_COMPARISON.ACTIONS'),
      t('EMPLOYEE_COMPARISON.EXAM_DIFF'),
      t('EMPLOYEE_COMPARISON.ACTION_DIFF'),
      '%',
    ];

    const rows = this.mergedRows.map(r => [
      this.getName(r),
      r.p1Exams.toString(), r.p1Actions.toString(),
      r.p2Exams.toString(), r.p2Actions.toString(),
      r.examDiff.toString(), r.actionDiff.toString(),
      r.examChangePercent !== null ? r.examChangePercent.toFixed(1) + '%' : '-',
    ]);

    rows.push([
      t('EMPLOYEE_COMPARISON.GRAND_TOTAL'),
      this.data.period1.totalExaminations.toString(),
      this.data.period1.totalStageActions.toString(),
      this.data.period2.totalExaminations.toString(),
      this.data.period2.totalStageActions.toString(),
      this.grandExamDiff.toString(),
      this.grandActionDiff.toString(),
      this.grandExamChangePercent !== null ? this.grandExamChangePercent.toFixed(1) + '%' : '-',
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
