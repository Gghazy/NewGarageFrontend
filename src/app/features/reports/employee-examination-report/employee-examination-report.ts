import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
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

@Component({
  selector: 'app-employee-examination-report',
  standalone: false,
  templateUrl: './employee-examination-report.html',
  styleUrl: './employee-examination-report.css',
})
export class EmployeeExaminationReport implements OnInit, OnDestroy {
  allEmployees: EmployeeExaminationReportDto[] = [];
  employees: EmployeeExaminationReportDto[] = [];
  branches: { id: string; nameAr: string; nameEn: string }[] = [];
  private destroy$ = new Subject<void>();

  dateFrom: string | undefined;
  dateTo: string | undefined;
  branchId: string | null = null;
  selectedEmployeeId: string | null = null;

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
    this.loadReport();
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReport(): void {
    const params: any = {};
    if (this.dateFrom) params.from = this.dateFrom;
    if (this.dateTo) params.to = this.dateTo;
    if (this.branchId) params.branchId = this.branchId;

    this.api.get<ApiResponse<EmployeeExaminationReportDto[]>>('Examinations/employee-report', { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allEmployees = res.data ?? [];
          this.applyEmployeeFilter();
        },
        error: () => this.toastr.error(this.translate.instant('COMMON.ERROR')),
      });
  }

  search(): void {
    this.selectedEmployeeId = null;
    this.loadReport();
  }

  applyEmployeeFilter(): void {
    if (this.selectedEmployeeId) {
      this.employees = this.allEmployees.filter(e => e.employeeId === this.selectedEmployeeId);
    } else {
      this.employees = this.allEmployees;
    }
  }

  onEmployeeFilterChange(): void {
    this.applyEmployeeFilter();
  }

  getStageName(stage: string): string {
    return this.translate.instant('EMPLOYEE_REPORT.STAGES.' + stage);
  }

  getStageCount(emp: EmployeeExaminationReportDto, stage: string): number {
    return emp.stageCounts?.find(s => s.stage === stage)?.count ?? 0;
  }

  exportToExcel(): void {
    const t = (key: string) => this.translate.instant(key);

    const headers = [
      '#',
      t('EMPLOYEE_REPORT.EMPLOYEE_NAME'),
      t('EMPLOYEE_REPORT.EXAMINATION_COUNT'),
      t('EMPLOYEE_REPORT.TOTAL_ACTIONS'),
      ...this.allStages.map(s => this.getStageName(s)),
    ];

    const rows = this.employees.map((emp, i) => [
      (i + 1).toString(),
      this.isAr ? emp.nameAr : emp.nameEn,
      emp.examinationCount.toString(),
      emp.totalStageActions.toString(),
      ...this.allStages.map(s => this.getStageCount(emp, s).toString()),
    ]);

    const bom = '\uFEFF';
    const csv = bom + [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-examination-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
