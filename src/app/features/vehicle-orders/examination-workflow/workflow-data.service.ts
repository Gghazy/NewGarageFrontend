import { Injectable } from '@angular/core';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { ExaminationDto, ExaminationItemDto } from 'src/app/shared/Models/vehicle-orders/vehicle-order-dto';

export interface WorkflowStageDto {
  value: number;
  nameEn: string;
  nameAr: string;
  items: ExaminationItemDto[];
}

export interface ExaminationWorkflowDto {
  examination: ExaminationDto;
  stages: WorkflowStageDto[];
}

export interface IssueItem {
  id: string;
  nameAr: string;
  nameEn: string;
  code?: string;
}

export const STAGE_ISSUE_API: Record<number, string> = {
  1: 'SensorIssues',
  3: 'InteriorBodyIssues',
  4: 'ExteriorBodyIssues',
  5: 'InsideAndDecorParts',
  6: 'AccessoryIssues',
  7: 'MechParts',
  9: 'RoadTestIssues',
};

const STAGE_GET_API: Record<number, string> = {
  1: 'stages/sensors',
  2: 'stages/dashboard-indicators',
  3: 'stages/interior-body',
  4: 'stages/exterior-body',
  5: 'stages/interior-decor',
  6: 'stages/accessories',
  7: 'stages/mechanical',
  8: 'stages/tires',
  9: 'stages/road-test',
};

@Injectable()
export class WorkflowDataService {
  exam: ExaminationDto | null = null;
  stages: WorkflowStageDto[] = [];
  issuesCache: Record<number, IssueItem[]> = {};
  completedStages = new Set<number>();
  loading = true;
  issuesLoading = false;
  readOnly = false;

  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  loadWorkflow(id: string): Observable<ExaminationWorkflowDto> {
    this.loading = true;
    return this.api.get<ApiResponse<ExaminationWorkflowDto>>(`Examinations/${id}/workflow`).pipe(
      map(res => res.data),
      tap(data => {
        this.exam = data.examination;
        this.stages = data.stages ?? [];
        this.loading = false;
        this.loadAllIssuesInParallel();
        this.loadCompletedStages();
      }),
    );
  }

  hasIssueApiForStage(stageValue: number): boolean {
    return !!STAGE_ISSUE_API[stageValue];
  }

  getIssuesForStage(stageValue: number): IssueItem[] {
    return this.issuesCache[stageValue] ?? [];
  }

  markStageCompleted(stageValue: number): void {
    this.completedStages.add(stageValue);
  }

  markStageIncomplete(stageValue: number): void {
    this.completedStages.delete(stageValue);
  }

  isStageCompleted(stageValue: number): boolean {
    return this.completedStages.has(stageValue);
  }

  reset(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroy$ = new Subject<void>();
    this.exam = null;
    this.stages = [];
    this.issuesCache = {};
    this.completedStages.clear();
    this.loading = true;
    this.issuesLoading = false;
    this.readOnly = false;
  }

  private loadAllIssuesInParallel(): void {
    const calls: Record<string, Observable<IssueItem[]>> = {};

    for (const stage of this.stages) {
      const apiUrl = STAGE_ISSUE_API[stage.value];
      if (!apiUrl) continue;
      calls[stage.value] = this.api.get<any>(apiUrl).pipe(
        map((res: any) => res.data ?? []),
        catchError(() => of([] as IssueItem[])),
      );
    }

    if (Object.keys(calls).length === 0) return;

    this.issuesLoading = true;
    forkJoin(calls)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (results: any) => {
          for (const [key, items] of Object.entries(results)) {
            this.issuesCache[+key] = items as IssueItem[];
          }
          this.issuesLoading = false;
        },
        error: () => {
          this.issuesLoading = false;
        },
      });
  }

  private loadCompletedStages(): void {
    const examId = this.exam?.id;
    if (!examId) return;

    const calls: Record<string, Observable<any>> = {};

    for (const stage of this.stages) {
      const apiPath = STAGE_GET_API[stage.value];
      if (!apiPath) continue;
      calls[stage.value] = this.api.get<ApiResponse<any>>(`Examinations/${examId}/${apiPath}`).pipe(
        map(res => res.data),
        catchError(() => of(null)),
      );
    }

    if (Object.keys(calls).length === 0) return;

    forkJoin(calls)
      .pipe(takeUntil(this.destroy$))
      .subscribe(results => {
        for (const [key, data] of Object.entries(results)) {
          if (!data) continue;
          const hasData = data.noIssuesFound
            || (data.items && data.items.length > 0)
            || (data.issues && data.issues.length > 0)
            || (data.indicators && data.indicators.length > 0);
          if (hasData) {
            this.completedStages.add(+key);
          }
        }
      });
  }
}
