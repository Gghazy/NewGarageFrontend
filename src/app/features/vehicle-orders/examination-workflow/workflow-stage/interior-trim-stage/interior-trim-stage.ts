import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-interior-trim-stage',
  templateUrl: './interior-trim-stage.html',
  standalone: false,
})
export class InteriorTrimStageComponent extends BaseStageComponent {
  readonly stageValue = 5;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
