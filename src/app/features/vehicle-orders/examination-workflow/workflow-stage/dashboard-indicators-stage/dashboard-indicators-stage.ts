import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-dashboard-indicators-stage',
  templateUrl: './dashboard-indicators-stage.html',
  standalone: false,
})
export class DashboardIndicatorsStageComponent extends BaseStageComponent {
  readonly stageValue = 2;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
