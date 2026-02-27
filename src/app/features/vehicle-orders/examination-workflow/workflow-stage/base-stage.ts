import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService, IssueItem } from '../workflow-data.service';

export abstract class BaseStageComponent {
  abstract readonly stageValue: number;

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
}
