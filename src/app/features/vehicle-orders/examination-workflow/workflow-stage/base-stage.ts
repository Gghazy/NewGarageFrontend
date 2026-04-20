import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService, IssueItem } from '../workflow-data.service';

export abstract class BaseStageComponent {
  abstract readonly stageValue: number;

  private savedSnapshot = '';

  constructor(
    protected translate: TranslateService,
    public workflowData: WorkflowDataService,
  ) {}

  get isAr(): boolean {
    return this.translate.currentLang === 'ar';
  }

  get hasIssueApi(): boolean {
    return this.workflowData.hasIssueApiForStage(this.stageValue);
  }

  get issues(): IssueItem[] {
    return this.workflowData.getIssuesForStage(this.stageValue);
  }

  get readOnly(): boolean {
    return this.workflowData.readOnly;
  }

  protected abstract getFormSnapshot(): unknown;

  protected captureSaved(): void {
    this.savedSnapshot = JSON.stringify(this.getFormSnapshot() ?? {});
  }

  get isDirty(): boolean {
    if (this.readOnly) return false;
    return JSON.stringify(this.getFormSnapshot() ?? {}) !== this.savedSnapshot;
  }

  canDeactivate(): boolean {
    if (!this.isDirty) return true;
    return window.confirm(this.translate.instant('WORKFLOW.UNSAVED_CHANGES_CONFIRM'));
  }
}
