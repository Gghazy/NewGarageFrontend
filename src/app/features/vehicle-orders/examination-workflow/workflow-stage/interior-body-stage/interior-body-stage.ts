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

interface InteriorBodyRow {
  partId: string;
  partNameAr: string;
  partNameEn: string;
  issueIds: string[];
}

interface InteriorBodyStageResultDto {
  noIssuesFound: boolean;
  comments: string | null;
  items: { partId: string; issueId: string }[];
}

@Component({
  selector: 'app-interior-body-stage',
  templateUrl: './interior-body-stage.html',
  styleUrls: ['../../examination-workflow.css'],
  standalone: false,
})
export class InteriorBodyStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 3;

  parts: LookupDto[] = [];
  allIssues: LookupDto[] = [];
  availableParts: LookupDto[] = [];
  loading = false;

  noIssuesFound = false;
  selectedPartId: string | null = null;
  rows: InteriorBodyRow[] = [];
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

  addPart(): void {
    if (!this.selectedPartId) return;
    const part = this.parts.find(p => p.id === this.selectedPartId);
    if (!part) return;

    this.rows.push({
      partId: part.id,
      partNameAr: part.nameAr,
      partNameEn: part.nameEn,
      issueIds: [],
    });
    this.selectedPartId = null;
    this.refreshAvailableParts();
  }

  removePart(index: number): void {
    this.rows.splice(index, 1);
    this.refreshAvailableParts();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.rows = [];
      this.selectedPartId = null;
      this.refreshAvailableParts();
    }
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const items: { partId: string; issueId: string }[] = [];
    for (const row of this.rows) {
      for (const issueId of row.issueIds) {
        items.push({ partId: row.partId, issueId });
      }
    }

    const payload = {
      noIssuesFound: this.noIssuesFound,
      comments: this.comments,
      items,
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/interior-body`, payload)
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

  private refreshAvailableParts(): void {
    const addedIds = new Set(this.rows.map(r => r.partId));
    this.availableParts = this.parts.filter(p => !addedIds.has(p.id));
  }

  private loadData(): void {
    const examId = this.workflowData.exam?.id;
    const search = { itemsPerPage: 200, currentPage: 1, textSearch: '', sort: 'nameAr', desc: false };

    this.loading = true;
    forkJoin({
      parts: this.api.post<any>('InteriorBodyParts/pagination', search),
      issues: this.api.post<any>('InteriorBodyIssues/pagination', search),
    }).pipe(
      tap(res => {
        this.parts = res.parts.data?.items ?? [];
        this.allIssues = res.issues.data?.items ?? [];
        this.refreshAvailableParts();
      }),
      switchMap(() => {
        if (!examId) return EMPTY;
        return this.api.get<ApiResponse<InteriorBodyStageResultDto>>(`Examinations/${examId}/stages/interior-body`);
      }),
      tap(res => this.applyExistingData(res.data)),
      takeUntil(this.destroy$),
      finalize(() => this.loading = false),
    ).subscribe();
  }

  private applyExistingData(data: InteriorBodyStageResultDto | null): void {
    if (!data) return;

    this.noIssuesFound = data.noIssuesFound;
    this.comments = data.comments ?? '';

    const grouped = new Map<string, string[]>();
    for (const item of data.items ?? []) {
      if (!grouped.has(item.partId)) {
        grouped.set(item.partId, []);
      }
      grouped.get(item.partId)!.push(item.issueId);
    }

    this.rows = [];
    for (const [partId, issueIds] of grouped) {
      const part = this.parts.find(p => p.id === partId);
      this.rows.push({
        partId,
        partNameAr: part?.nameAr ?? '',
        partNameEn: part?.nameEn ?? '',
        issueIds,
      });
    }
    this.refreshAvailableParts();

    if (data.noIssuesFound || (data.items?.length ?? 0) > 0) {
      this.workflowData.markStageCompleted(this.stageValue);
    }
  }
}
