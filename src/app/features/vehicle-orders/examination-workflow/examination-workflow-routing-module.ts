import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExaminationWorkflowLayout } from './examination-workflow-layout';
import { SensorsStageComponent } from './workflow-stage/sensors-stage/sensors-stage';
import { DashboardIndicatorsStageComponent } from './workflow-stage/dashboard-indicators-stage/dashboard-indicators-stage';
import { InteriorBodyStageComponent } from './workflow-stage/interior-body-stage/interior-body-stage';
import { ExteriorBodyStageComponent } from './workflow-stage/exterior-body-stage/exterior-body-stage';
import { InteriorTrimStageComponent } from './workflow-stage/interior-trim-stage/interior-trim-stage';
import { ExteriorAccessoriesStageComponent } from './workflow-stage/exterior-accessories-stage/exterior-accessories-stage';
import { MechanicalStageComponent } from './workflow-stage/mechanical-stage/mechanical-stage';
import { TiresStageComponent } from './workflow-stage/tires-stage/tires-stage';
import { RoadTestStageComponent } from './workflow-stage/road-test-stage/road-test-stage';

const routes: Routes = [
  {
    path: '',
    component: ExaminationWorkflowLayout,
    children: [
      { path: 'Sensors', component: SensorsStageComponent },
      { path: 'DashboardIndicators', component: DashboardIndicatorsStageComponent },
      { path: 'InteriorBody', component: InteriorBodyStageComponent },
      { path: 'ExteriorBody', component: ExteriorBodyStageComponent },
      { path: 'InteriorAndTrim', component: InteriorTrimStageComponent },
      { path: 'ExteriorAccessories', component: ExteriorAccessoriesStageComponent },
      { path: 'MechanicalIssues', component: MechanicalStageComponent },
      { path: 'Tires', component: TiresStageComponent },
      { path: 'RoadTest', component: RoadTestStageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExaminationWorkflowRoutingModule {}
