import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-interior-body-stage',
  templateUrl: './interior-body-stage.html',
  standalone: false,
})
export class InteriorBodyStageComponent extends BaseStageComponent {
  readonly stageValue = 3;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
