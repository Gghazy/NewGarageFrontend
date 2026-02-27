import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared-module';
import { ExaminationWorkflowRoutingModule } from './examination-workflow-routing-module';
import { ExaminationWorkflowLayout } from './examination-workflow-layout';
import { WorkflowDataService } from './workflow-data.service';
import { SensorsStageComponent } from './workflow-stage/sensors-stage/sensors-stage';
import { DashboardIndicatorsStageComponent } from './workflow-stage/dashboard-indicators-stage/dashboard-indicators-stage';
import { InteriorBodyStageComponent } from './workflow-stage/interior-body-stage/interior-body-stage';
import { ExteriorBodyStageComponent } from './workflow-stage/exterior-body-stage/exterior-body-stage';
import { InteriorTrimStageComponent } from './workflow-stage/interior-trim-stage/interior-trim-stage';
import { ExteriorAccessoriesStageComponent } from './workflow-stage/exterior-accessories-stage/exterior-accessories-stage';
import { MechanicalStageComponent } from './workflow-stage/mechanical-stage/mechanical-stage';
import { TiresStageComponent } from './workflow-stage/tires-stage/tires-stage';
import { RoadTestStageComponent } from './workflow-stage/road-test-stage/road-test-stage';
import { ApprovalStageComponent } from './workflow-stage/approval-stage/approval-stage';

@NgModule({
  declarations: [
    ExaminationWorkflowLayout,
    SensorsStageComponent,
    DashboardIndicatorsStageComponent,
    InteriorBodyStageComponent,
    ExteriorBodyStageComponent,
    InteriorTrimStageComponent,
    ExteriorAccessoriesStageComponent,
    MechanicalStageComponent,
    TiresStageComponent,
    RoadTestStageComponent,
    ApprovalStageComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ExaminationWorkflowRoutingModule,
  ],
  providers: [
    WorkflowDataService,
  ],
})
export class ExaminationWorkflowModule {}
