import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { finalize, takeUntil, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

interface TireStageResultDto {
  noIssuesFound: boolean;
  comments: string | null;
  items: { position: string; year: number | null; week: number | null; condition: string | null }[];
}

export interface TireData {
  position: string;
  labelKey: string;
  year: number | null;
  week: number | null;
  condition: string | null;
}

export interface ConditionOption {
  value: string;
  labelKey: string;
}

@Component({
  selector: 'app-tires-stage',
  templateUrl: './tires-stage.html',
  styleUrls: ['./tires-stage.css'],
  standalone: false,
})
export class TiresStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 8;

  loading = false;
  saving = false;
  noIssuesFound = false;
  comments = '';

  tires: TireData[] = [
    { position: 'FrontRight', labelKey: 'WORKFLOW.TIRE_POSITION_FRONT_RIGHT', year: null, week: null, condition: null },
    { position: 'FrontLeft', labelKey: 'WORKFLOW.TIRE_POSITION_FRONT_LEFT', year: null, week: null, condition: null },
    { position: 'RearRight', labelKey: 'WORKFLOW.TIRE_POSITION_REAR_RIGHT', year: null, week: null, condition: null },
    { position: 'RearLeft', labelKey: 'WORKFLOW.TIRE_POSITION_REAR_LEFT', year: null, week: null, condition: null },
    { position: 'Spare', labelKey: 'WORKFLOW.TIRE_POSITION_SPARE', year: null, week: null, condition: null },
  ];

  yearOptions: number[] = [];
  weekOptions: number[] = [];
  conditionOptions: ConditionOption[] = [
    { value: 'Good', labelKey: 'WORKFLOW.CONDITION_GOOD' },
    { value: 'Average', labelKey: 'WORKFLOW.CONDITION_AVERAGE' },
    { value: 'Bad', labelKey: 'WORKFLOW.CONDITION_BAD' },
    { value: 'NeedsReplacement', labelKey: 'WORKFLOW.CONDITION_NEEDS_REPLACEMENT' },
  ];

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
    this.buildYearOptions();
    this.buildWeekOptions();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.tires.forEach(t => {
        t.year = null;
        t.week = null;
        t.condition = null;
      });
    }
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const payload = {
      noIssuesFound: this.noIssuesFound,
      comments: this.comments,
      items: this.noIssuesFound ? [] : this.tires.map(t => ({
        position: t.position,
        year: t.year,
        week: t.week,
        condition: t.condition,
      })),
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/tires`, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.saving = false),
      )
      .subscribe({
        next: () => {
          this.workflowData.markStageCompleted(this.stageValue);
          this.toastr.success(this.translate.instant('WORKFLOW.SAVED'));
        },
        error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR')),
      });
  }

  private buildYearOptions(): void {
    const currentYear = new Date().getFullYear();
    this.yearOptions = [];
    for (let y = currentYear; y >= currentYear - 20; y--) {
      this.yearOptions.push(y);
    }
  }

  private buildWeekOptions(): void {
    this.weekOptions = [];
    for (let w = 1; w <= 52; w++) {
      this.weekOptions.push(w);
    }
  }

  private loadData(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.loading = true;
    this.api.get<ApiResponse<TireStageResultDto>>(`Examinations/${examId}/stages/tires`)
      .pipe(
        tap(res => this.applyExistingData(res.data)),
        takeUntil(this.destroy$),
        finalize(() => this.loading = false),
      )
      .subscribe();
  }

  private applyExistingData(data: TireStageResultDto | null): void {
    if (!data) return;

    this.noIssuesFound = data.noIssuesFound;
    this.comments = data.comments ?? '';

    for (const item of data.items ?? []) {
      const tire = this.tires.find(t => t.position === item.position);
      if (tire) {
        tire.year = item.year;
        tire.week = item.week;
        tire.condition = item.condition;
      }
    }

    if (data.noIssuesFound || (data.items && data.items.length > 0)) {
      this.workflowData.markStageCompleted(this.stageValue);
    }
  }
}
