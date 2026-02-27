import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { WorkflowDataService } from '../../workflow-data.service';
import { BaseStageComponent } from '../base-stage';

@Component({
  selector: 'app-tires-stage',
  templateUrl: './tires-stage.html',
  standalone: false,
})
export class TiresStageComponent extends BaseStageComponent {
  readonly stageValue = 8;

  constructor(translate: TranslateService, workflowData: WorkflowDataService) {
    super(translate, workflowData);
  }
}
