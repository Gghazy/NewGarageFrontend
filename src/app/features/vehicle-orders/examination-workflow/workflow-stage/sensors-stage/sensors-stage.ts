import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-sensors-stage',
  templateUrl: './sensors-stage.html',
  standalone: false,
})
export class SensorsStageComponent extends BaseStageComponent {
  readonly stageValue = 1;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
