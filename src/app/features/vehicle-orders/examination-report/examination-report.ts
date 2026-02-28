import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { INDICATORS, IndicatorDef } from '../examination-workflow/workflow-stage/dashboard-indicators-stage/dashboard-indicators-stage';

interface ExaminationReportDto {
  examination: any;
  sensorStage: SensorStageReport | null;
  dashboardIndicatorsStage: DashboardStageReport | null;
  interiorBodyStage: PartIssueStageReport | null;
  exteriorBodyStage: PartIssueStageReport | null;
  interiorDecorStage: PartIssueStageReport | null;
  accessoryStage: PartIssueStageReport | null;
  mechanicalStage: MechanicalStageReport | null;
  tireStage: TireStageReport | null;
  roadTestStage: RoadTestStageReport | null;
}

interface SensorStageReport {
  noIssuesFound: boolean;
  cylinderCount: number;
  comments: string | null;
  issues: { nameAr: string; nameEn: string; code: string | null; evaluation: string }[];
}

interface DashboardStageReport {
  comments: string | null;
  indicators: { key: string; value: number | null; notApplicable: boolean }[];
}

interface PartIssueStageReport {
  noIssuesFound: boolean;
  comments: string | null;
  items: { partNameAr: string; partNameEn: string; issueNameAr: string; issueNameEn: string }[];
}

interface MechanicalStageReport {
  noIssuesFound: boolean;
  comments: string | null;
  rows: {
    partTypeNameAr: string; partTypeNameEn: string;
    partNameAr: string; partNameEn: string;
    issues: { nameAr: string; nameEn: string }[];
  }[];
}

interface TireStageReport {
  noIssuesFound: boolean;
  comments: string | null;
  items: { position: string; year: number | null; week: number | null; condition: string | null }[];
}

interface RoadTestStageReport {
  noIssuesFound: boolean;
  comments: string | null;
  items: { issueTypeNameAr: string; issueTypeNameEn: string; issueNameAr: string; issueNameEn: string }[];
}

@Component({
  selector: 'app-examination-report',
  standalone: false,
  templateUrl: './examination-report.html',
  styleUrls: ['./examination-report.css'],
})
export class ExaminationReport implements OnInit, OnDestroy {
  report: ExaminationReportDto | null = null;
  loading = false;
  readonly indicators: IndicatorDef[] = INDICATORS;

  private examinationId!: string;
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.examinationId = params.get('id')!;
        this.loadReport();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get exam(): any {
    return this.report?.examination;
  }

  getPlateDisplay(): string {
    if (!this.exam) return '—';
    const letters = this.exam.plateLetters ?? '';
    const numbers = this.exam.plateNumbers ?? '';
    if (!letters && !numbers) return '—';
    return `${letters} ${numbers}`.trim();
  }

  getIndicatorLabel(key: string): string {
    const ind = this.indicators.find(i => i.key === key);
    if (!ind) return key;
    return this.isAr ? ind.labelAr : ind.labelEn;
  }

  getTirePositionLabel(position: string): string {
    return this.translate.instant('WORKFLOW.TIRE_POSITION_' + position.toUpperCase().replace(/([A-Z])/g, '_$1').replace(/^_/, '').replace(/__/g, '_'));
  }

  getTirePosition(position: string): string {
    const map: Record<string, string> = {
      FrontRight: 'WORKFLOW.TIRE_POSITION_FRONT_RIGHT',
      FrontLeft: 'WORKFLOW.TIRE_POSITION_FRONT_LEFT',
      RearRight: 'WORKFLOW.TIRE_POSITION_REAR_RIGHT',
      RearLeft: 'WORKFLOW.TIRE_POSITION_REAR_LEFT',
      Spare: 'WORKFLOW.TIRE_POSITION_SPARE',
    };
    return this.translate.instant(map[position] ?? position);
  }

  getTireCondition(condition: string | null): string {
    if (!condition) return '—';
    const map: Record<string, string> = {
      Good: 'WORKFLOW.CONDITION_GOOD',
      Average: 'WORKFLOW.CONDITION_AVERAGE',
      Bad: 'WORKFLOW.CONDITION_BAD',
      NeedsReplacement: 'WORKFLOW.CONDITION_NEEDS_REPLACEMENT',
    };
    return this.translate.instant(map[condition] ?? condition);
  }

  getEvaluation(evaluation: string): string {
    const map: Record<string, string> = {
      active: 'WORKFLOW.ACTIVE',
      stored: 'WORKFLOW.STORED',
    };
    return this.translate.instant(map[evaluation] ?? evaluation);
  }

  print(): void {
    this.api.getFile(`Examinations/${this.examinationId}/report-pdf`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'examination-report.pdf';
        a.click();
        URL.revokeObjectURL(a.href);
      });
  }

  goBack(): void {
    this.router.navigate(['/features/vehicle-orders', this.examinationId, 'details']);
  }

  private loadReport(): void {
    this.loading = true;
    this.api.get<any>(`Examinations/${this.examinationId}/report-data`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.report = res.data;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/features/vehicle-orders', this.examinationId, 'details']);
        },
      });
  }
}
