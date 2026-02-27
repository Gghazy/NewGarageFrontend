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
  partTypeNameAr: string;
  partTypeNameEn: string;
  partIds: string[];
}

interface MechanicalStageResultDto {
  noIssuesFound: boolean;
  comments: string | null;
  items: { partTypeId: string; partId: string }[];
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
  availablePartTypes: LookupDto[] = [];
  loading = false;

  noIssuesFound = false;
  selectedPartTypeId: string | null = null;
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

  getPartsForType(partTypeId: string): MechPartDto[] {
    return this.allParts.filter(i => i.mechPartTypeId === partTypeId);
  }

  addPartType(): void {
    if (!this.selectedPartTypeId) return;
    const type = this.partTypes.find(t => t.id === this.selectedPartTypeId);
    if (!type) return;

    this.rows.push({
      partTypeId: type.id,
      partTypeNameAr: type.nameAr,
      partTypeNameEn: type.nameEn,
      partIds: [],
    });
    this.selectedPartTypeId = null;
    this.refreshAvailableTypes();
  }

  removeRow(index: number): void {
    this.rows.splice(index, 1);
    this.refreshAvailableTypes();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.rows = [];
      this.selectedPartTypeId = null;
      this.refreshAvailableTypes();
    }
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const items: { partTypeId: string; partId: string }[] = [];
    for (const row of this.rows) {
      for (const partId of row.partIds) {
        items.push({ partTypeId: row.partTypeId, partId });
      }
    }

    const payload = {
      noIssuesFound: this.noIssuesFound,
      comments: this.comments,
      items,
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

  private refreshAvailableTypes(): void {
    const addedIds = new Set(this.rows.map(r => r.partTypeId));
    this.availablePartTypes = this.partTypes.filter(t => !addedIds.has(t.id));
  }

  private loadData(): void {
    const examId = this.workflowData.exam?.id;
    const search = { itemsPerPage: 200, currentPage: 1, textSearch: '', sort: 'nameAr', desc: false };

    this.loading = true;
    forkJoin({
      partTypes: this.api.post<any>('MechPartTypes/pagination', search),
      parts: this.api.post<any>('MechParts/pagination', search),
    }).pipe(
      tap(res => {
        this.partTypes = res.partTypes.data?.items ?? [];
        this.allParts = res.parts.data?.items ?? [];
        this.refreshAvailableTypes();
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

    const grouped = new Map<string, string[]>();
    for (const item of data.items ?? []) {
      if (!grouped.has(item.partTypeId)) {
        grouped.set(item.partTypeId, []);
      }
      grouped.get(item.partTypeId)!.push(item.partId);
    }

    this.rows = [];
    for (const [partTypeId, partIds] of grouped) {
      const type = this.partTypes.find(t => t.id === partTypeId);
      this.rows.push({
        partTypeId,
        partTypeNameAr: type?.nameAr ?? '',
        partTypeNameEn: type?.nameEn ?? '',
        partIds,
      });
    }
    this.refreshAvailableTypes();

    if (data.noIssuesFound || (data.items?.length ?? 0) > 0) {
      this.workflowData.markStageCompleted(this.stageValue);
    }
  }
}
