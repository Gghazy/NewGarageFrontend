import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-approval-stage',
  templateUrl: './approval-stage.html',
  standalone: false,
})
export class ApprovalStageComponent extends BaseStageComponent {
  readonly stageValue = 10;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
