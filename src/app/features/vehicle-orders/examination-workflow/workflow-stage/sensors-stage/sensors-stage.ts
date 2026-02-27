import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

export interface SensorIssueDto {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
}

export interface SensorIssueRow {
  issueId: string;
  code: string;
  nameAr: string;
  nameEn: string;
  evaluation: 'active' | 'stored';
}

@Component({
  selector: 'app-sensors-stage',
  templateUrl: './sensors-stage.html',
  styleUrls: ['../../examination-workflow.css'],
  standalone: false,
})
export class SensorsStageComponent extends BaseStageComponent implements OnInit, OnDestroy {
  readonly stageValue = 1;

  sensorIssues: SensorIssueDto[] = [];
  availableIssues: SensorIssueDto[] = [];
  issuesLoading = false;
  dataLoading = false;

  noIssuesFound = false;
  cylinderCount: number | null = 4;
  selectedIssueId: string | null = null;
  addedIssues: SensorIssueRow[] = [];
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
    this.loadSensorIssues();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addIssue(): void {
    if (!this.selectedIssueId) return;
    const issue = this.sensorIssues.find(i => i.id === this.selectedIssueId);
    if (!issue) return;

    this.addedIssues.push({
      issueId: issue.id,
      code: issue.code,
      nameAr: issue.nameAr,
      nameEn: issue.nameEn,
      evaluation: 'active',
    });
    this.selectedIssueId = null;
    this.refreshAvailable();
  }

  removeIssue(index: number): void {
    this.addedIssues.splice(index, 1);
    this.refreshAvailable();
  }

  toggleNoIssues(): void {
    if (this.noIssuesFound) {
      this.addedIssues = [];
      this.selectedIssueId = null;
      this.cylinderCount = null;
      this.refreshAvailable();
    }
  }

  private refreshAvailable(): void {
    const addedIds = new Set(this.addedIssues.map(i => i.issueId));
    this.availableIssues = this.sensorIssues.filter(i => !addedIds.has(i.id));
  }

  save(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.saving = true;
    const payload = {
      noIssuesFound: this.noIssuesFound,
      cylinderCount: this.cylinderCount ?? 0,
      comments: this.comments,
      issues: this.addedIssues.map(i => ({
        issueId: i.issueId,
        evaluation: i.evaluation,
      })),
    };

    this.api.post<ApiResponse<string>>(`Examinations/${examId}/stages/sensors`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.toastr.success(this.translate.instant('WORKFLOW.SAVED'));
        },
        error: (err) => {
          this.saving = false;
          this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.ERROR'));
        },
      });
  }

  private loadExistingData(): void {
    const examId = this.workflowData.exam?.id;
    if (!examId) return;

    this.dataLoading = true;
    this.api.get<ApiResponse<any>>(`Examinations/${examId}/stages/sensors`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.dataLoading = false;
          const data = res.data;
          if (!data) return;
          this.noIssuesFound = data.noIssuesFound;
          this.cylinderCount = data.cylinderCount;
          this.comments = data.comments ?? '';
          this.addedIssues = (data.issues ?? []).map((i: any) => {
            const issue = this.sensorIssues.find(s => s.id === i.issueId);
            return {
              issueId: i.issueId,
              code: issue?.code ?? '',
              nameAr: issue?.nameAr ?? '',
              nameEn: issue?.nameEn ?? '',
              evaluation: i.evaluation,
            } as SensorIssueRow;
          });
          this.refreshAvailable();
        },
        error: () => {
          this.dataLoading = false;
        },
      });
  }

  private loadSensorIssues(): void {
    this.issuesLoading = true;
    this.api.get<ApiResponse<SensorIssueDto[]>>('SensorIssues')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.sensorIssues = res.data;
          this.refreshAvailable();
          this.issuesLoading = false;
          this.loadExistingData();
        },
        error: () => {
          this.issuesLoading = false;
        },
      });
  }
}
