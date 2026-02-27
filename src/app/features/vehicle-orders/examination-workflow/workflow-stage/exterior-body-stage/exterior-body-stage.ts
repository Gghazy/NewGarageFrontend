import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-exterior-body-stage',
  templateUrl: './exterior-body-stage.html',
  standalone: false,
})
export class ExteriorBodyStageComponent extends BaseStageComponent {
  readonly stageValue = 4;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
