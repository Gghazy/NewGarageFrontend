import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

export interface IndicatorDef {
  key: string;
  labelAr: string;
  labelEn: string;
  unit: string;
  min: number;
  max: number;
  normalMin: number;
  normalMax: number;
}

export interface IndicatorValue {
  value: number | null;
  notApplicable: boolean;
}

export const INDICATORS: IndicatorDef[] = [
  { key: 'ect', labelAr: 'الحرارة (ECT °C)', labelEn: 'Temperature (ECT °C)', unit: '', min: 0, max: 115, normalMin: 70, normalMax: 115 },
  { key: 'batteryVoltage', labelAr: 'جهد البطارية BV', labelEn: 'Battery Voltage BV', unit: 'V', min: 0, max: 20, normalMin: 13, normalMax: 15 },
  { key: 'oilPressure', labelAr: 'ضغط طرمبة الزيت (KPA)', labelEn: 'Oil Pump Pressure (KPA)', unit: '', min: 0, max: 350, normalMin: 100, normalMax: 350 },
  { key: 'transmissionTemp', labelAr: 'حرارة ناقل الحركة', labelEn: 'Transmission Temp', unit: '', min: 0, max: 100, normalMin: 60, normalMax: 100 },
];

interface DashboardIndicatorsResultDto {
  comments: string | null;
  indicators: { key: string; value: number | null; notApplicable: boolean }[];
}

@Component({
  selector: 'app-dashboard-indicators-stage',
  templateUrl: './dashboard-indicators-stage.html',
  styleUrls: ['../../examination-workflow.css'],
  standalone: false,
})
export class DashboardIndicatorsStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 2;
  readonly indicators = INDICATORS;

  values: Record<string, IndicatorValue> = {};
  comments = '';
  loading = false;
  saving = false;

  private destroy$ = new Subject<void>();

  constructor(
    translate: TranslateService,
    workflowData: WorkflowDataService,
    private api: ApiService,
    private toastr: ToastrService,
  ) {
    super(translate, workflowData);
  }

  ngOnInit(): void {
    for (const ind of this.indicators) {
      this.values[ind.key] = { value: null, notApplicable: false };
    }
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleNotApplicable(key: string): void {
    if (this.values[key].notApplicable) {
      this.values[key].value = null;
    }
  }

  getMarkerPercent(ind: IndicatorDef): number {
    const v = this.values[ind.key];
    if (!v || v.notApplicable || v.value == null) return -1;
    const pct = ((v.value - ind.min) / (ind.max - ind.min)) * 100;
    return Math.max(0, Math.min(100, pct));
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const payload = {
      comments: this.comments,
      indicators: this.indicators.map(ind => ({
        key: ind.key,
        value: this.values[ind.key].value,
        notApplicable: this.values[ind.key].notApplicable,
      })),
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/dashboard-indicators`, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.saving = false),
      )
      .subscribe({
        next: () => {
          if (this.hasAnyData()) {
            this.workflowData.markStageCompleted(this.stageValue);
          } else {
            this.workflowData.markStageIncomplete(this.stageValue);
          }
          this.toastr.success(this.translate.instant('WORKFLOW.SAVED'));
        },
        error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR')),
      });
  }

  private hasAnyData(): boolean {
    return this.indicators.some(ind => {
      const v = this.values[ind.key];
      return v.notApplicable || v.value != null;
    });
  }

  private loadData(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.loading = true;
    this.api.get<ApiResponse<DashboardIndicatorsResultDto>>(`Examinations/${examId}/stages/dashboard-indicators`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
      )
      .subscribe({
        next: res => {
          const data = res.data;
          if (!data) return;
          this.comments = data.comments ?? '';
          for (const ind of data.indicators ?? []) {
            if (this.values[ind.key]) {
              this.values[ind.key] = { value: ind.value, notApplicable: ind.notApplicable };
            }
          }
          if (this.hasAnyData()) {
            this.workflowData.markStageCompleted(this.stageValue);
          }
        },
      });
  }
}
