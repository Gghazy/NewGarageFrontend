import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { EMPTY, Subject, forkJoin } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

interface LookupDto {
  id: string;
  nameAr: string;
  nameEn: string;
}

interface RoadTestIssueDto {
  id: string;
  nameAr: string;
  nameEn: string;
  roadTestIssueTypeId: string;
}

interface RoadTestRow {
  issueTypeId: string;
  issueId: string;
}

interface RoadTestStageResultDto {
  noIssuesFound: boolean;
  comments: string | null;
  items: { issueTypeId: string; issueId: string }[];
}

@Component({
  selector: 'app-road-test-stage',
  templateUrl: './road-test-stage.html',
  styleUrls: ['../../examination-workflow.css'],
  standalone: false,
})
export class RoadTestStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 9;

  issueTypes: LookupDto[] = [];
  allIssues: RoadTestIssueDto[] = [];
  filteredIssues: RoadTestIssueDto[] = [];
  loading = false;

  noIssuesFound = false;
  selectedIssueTypeId: string | null = null;
  selectedIssueId: string | null = null;
  rows: RoadTestRow[] = [];
  comments = '';
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
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIssueTypeChange(): void {
    this.selectedIssueId = null;
    if (!this.selectedIssueTypeId) {
      this.filteredIssues = [];
      return;
    }
    const addedIssueIds = new Set(this.rows.map(r => r.issueId));
    this.filteredIssues = this.allIssues.filter(
      i => i.roadTestIssueTypeId === this.selectedIssueTypeId && !addedIssueIds.has(i.id),
    );
  }

  getIssueTypeName(issueTypeId: string): string {
    const t = this.issueTypes.find(it => it.id === issueTypeId);
    if (!t) return '';
    return this.isAr ? t.nameAr : t.nameEn;
  }

  getIssueName(issueId: string): string {
    const i = this.allIssues.find(it => it.id === issueId);
    if (!i) return '';
    return this.isAr ? i.nameAr : i.nameEn;
  }

  addRow(): void {
    if (!this.selectedIssueTypeId || !this.selectedIssueId) return;
    if (this.rows.some(r => r.issueId === this.selectedIssueId)) return;

    this.rows.push({
      issueTypeId: this.selectedIssueTypeId,
      issueId: this.selectedIssueId,
    });

    this.selectedIssueId = null;
    this.onIssueTypeChange();
  }

  removeRow(index: number): void {
    this.rows.splice(index, 1);
    this.onIssueTypeChange();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.rows = [];
      this.selectedIssueTypeId = null;
      this.selectedIssueId = null;
      this.filteredIssues = [];
    }
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;

    const payload = {
      noIssuesFound: this.noIssuesFound,
      comments: this.comments,
      items: this.rows.map(r => ({ issueTypeId: r.issueTypeId, issueId: r.issueId })),
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/road-test`, payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.saving = false),
      )
      .subscribe({
        next: () => {
          if (this.noIssuesFound || this.rows.length > 0) {
            this.workflowData.markStageCompleted(this.stageValue);
          } else {
            this.workflowData.markStageIncomplete(this.stageValue);
          }
          this.toastr.success(this.translate.instant('WORKFLOW.SAVED'));
        },
        error: (err) => this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR')),
      });
  }

  private loadData(): void {
    const examId = this.workflowData.exam?.id;

    this.loading = true;
    forkJoin({
      issueTypes: this.api.get<any>('RoadTestIssueTypes'),
      issues: this.api.get<any>('RoadTestIssues'),
    }).pipe(
      tap(res => {
        this.issueTypes = res.issueTypes.data ?? [];
        this.allIssues = res.issues.data ?? [];
      }),
      switchMap(() => {
        if (!examId) return EMPTY;
        return this.api.get<ApiResponse<RoadTestStageResultDto>>(`Examinations/${examId}/stages/road-test`);
      }),
      tap(res => this.applyExistingData(res.data)),
      takeUntil(this.destroy$),
      finalize(() => this.loading = false),
    ).subscribe();
  }

  private applyExistingData(data: RoadTestStageResultDto | null): void {
    if (!data) return;

    this.noIssuesFound = data.noIssuesFound;
    this.comments = data.comments ?? '';

    this.rows = (data.items ?? []).map(item => ({
      issueTypeId: item.issueTypeId,
      issueId: item.issueId,
    }));

    if (data.noIssuesFound || (data.items?.length ?? 0) > 0) {
      this.workflowData.markStageCompleted(this.stageValue);
    }
  }
}
