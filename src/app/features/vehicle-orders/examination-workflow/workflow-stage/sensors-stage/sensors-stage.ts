import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
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
    this.saving = true;
    // TODO: wire to backend API when ready
    const payload = {
      stageValue: this.stageValue,
      noIssuesFound: this.noIssuesFound,
      cylinderCount: this.cylinderCount,
      comments: this.comments,
      issues: this.addedIssues.map(i => ({
        issueId: i.issueId,
        evaluation: i.evaluation,
      })),
    };
    console.log('Save payload:', payload);
    setTimeout(() => {
      this.saving = false;
    }, 500);
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
        },
        error: () => {
          this.issuesLoading = false;
        },
      });
  }
}
