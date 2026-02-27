import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-exterior-accessories-stage',
  templateUrl: './exterior-accessories-stage.html',
  standalone: false,
})
export class ExteriorAccessoriesStageComponent extends BaseStageComponent {
  readonly stageValue = 6;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
