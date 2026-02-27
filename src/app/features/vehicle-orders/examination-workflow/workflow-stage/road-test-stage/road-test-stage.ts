import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-road-test-stage',
  templateUrl: './road-test-stage.html',
  standalone: false,
})
export class RoadTestStageComponent extends BaseStageComponent {
  readonly stageValue = 9;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
