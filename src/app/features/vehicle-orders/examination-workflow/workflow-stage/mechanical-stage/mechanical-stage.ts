import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-mechanical-stage',
  templateUrl: './mechanical-stage.html',
  standalone: false,
})
export class MechanicalStageComponent extends BaseStageComponent {
  readonly stageValue = 7;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
