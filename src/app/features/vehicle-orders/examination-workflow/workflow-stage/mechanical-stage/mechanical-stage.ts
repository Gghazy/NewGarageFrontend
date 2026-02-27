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

interface MechPartDto {
  id: string;
  nameAr: string;
  nameEn: string;
  mechPartTypeId: string;
}

interface MechanicalRow {
  partTypeId: string;
  partId: string;
  issueIds: string[];
}

interface MechanicalStageResultDto {
  noIssuesFound: boolean;
  comments: string | null;
  items: { partTypeId: string; partId: string }[];
  issueItems: { partId: string; issueId: string }[];
}

@Component({
  selector: 'app-mechanical-stage',
  templateUrl: './mechanical-stage.html',
  styleUrls: ['../../examination-workflow.css'],
  standalone: false,
})
export class MechanicalStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 7;

  partTypes: LookupDto[] = [];
  allParts: MechPartDto[] = [];
  allIssues: LookupDto[] = [];
  filteredParts: MechPartDto[] = [];
  loading = false;

  noIssuesFound = false;
  selectedPartTypeId: string | null = null;
  selectedPartId: string | null = null;
  rows: MechanicalRow[] = [];
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

  onPartTypeChange(): void {
    this.selectedPartId = null;
    if (!this.selectedPartTypeId) {
      this.filteredParts = [];
      return;
    }
    const addedPartIds = new Set(this.rows.map(r => r.partId));
    this.filteredParts = this.allParts.filter(
      p => p.mechPartTypeId === this.selectedPartTypeId && !addedPartIds.has(p.id),
    );
  }

  getPartTypeName(partTypeId: string): string {
    const t = this.partTypes.find(pt => pt.id === partTypeId);
    if (!t) return '';
    return this.isAr ? t.nameAr : t.nameEn;
  }

  getPartName(partId: string): string {
    const p = this.allParts.find(pt => pt.id === partId);
    if (!p) return '';
    return this.isAr ? p.nameAr : p.nameEn;
  }

  addRow(): void {
    if (!this.selectedPartTypeId || !this.selectedPartId) return;
    if (this.rows.some(r => r.partId === this.selectedPartId)) return;

    this.rows.push({
      partTypeId: this.selectedPartTypeId,
      partId: this.selectedPartId,
      issueIds: [],
    });

    this.selectedPartId = null;
    this.onPartTypeChange();
  }

  removeRow(index: number): void {
    this.rows.splice(index, 1);
    this.onPartTypeChange();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.rows = [];
      this.selectedPartTypeId = null;
      this.selectedPartId = null;
      this.filteredParts = [];
    }
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const items: { partTypeId: string; partId: string }[] = [];
    const issueItems: { partId: string; issueId: string }[] = [];

    for (const row of this.rows) {
      items.push({ partTypeId: row.partTypeId, partId: row.partId });
      for (const issueId of row.issueIds) {
        issueItems.push({ partId: row.partId, issueId });
      }
    }

    const payload = {
      noIssuesFound: this.noIssuesFound,
      comments: this.comments,
      items,
      issueItems,
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/mechanical`, payload)
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
    const search = { itemsPerPage: 200, currentPage: 1, textSearch: '', sort: 'nameAr', desc: false };

    this.loading = true;
    forkJoin({
      partTypes: this.api.post<any>('MechPartTypes/pagination', search),
      parts: this.api.post<any>('MechParts/pagination', search),
      issues: this.api.post<any>('MechIssues/pagination', search),
    }).pipe(
      tap(res => {
        this.partTypes = res.partTypes.data?.items ?? [];
        this.allParts = res.parts.data?.items ?? [];
        this.allIssues = res.issues.data?.items ?? [];
      }),
      switchMap(() => {
        if (!examId) return EMPTY;
        return this.api.get<ApiResponse<MechanicalStageResultDto>>(`Examinations/${examId}/stages/mechanical`);
      }),
      tap(res => this.applyExistingData(res.data)),
      takeUntil(this.destroy$),
      finalize(() => this.loading = false),
    ).subscribe();
  }

  private applyExistingData(data: MechanicalStageResultDto | null): void {
    if (!data) return;

    this.noIssuesFound = data.noIssuesFound;
    this.comments = data.comments ?? '';

    // Group issues by partId
    const issuesByPart = new Map<string, string[]>();
    for (const ii of data.issueItems ?? []) {
      if (!issuesByPart.has(ii.partId)) {
        issuesByPart.set(ii.partId, []);
      }
      issuesByPart.get(ii.partId)!.push(ii.issueId);
    }

    // Each item = one row
    this.rows = (data.items ?? []).map(item => ({
      partTypeId: item.partTypeId,
      partId: item.partId,
      issueIds: issuesByPart.get(item.partId) ?? [],
    }));

    if (data.noIssuesFound || (data.items?.length ?? 0) > 0) {
      this.workflowData.markStageCompleted(this.stageValue);
    }
  }
}
