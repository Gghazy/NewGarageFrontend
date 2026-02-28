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
    data: { breadcrumb: '' },
    children: [
      {
        path: 'Sensors',
        component: SensorsStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'DashboardIndicators',
        component: DashboardIndicatorsStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'InteriorBody',
        component: InteriorBodyStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'ExteriorBody',
        component: ExteriorBodyStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'InteriorAndTrim',
        component: InteriorTrimStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'ExteriorAccessories',
        component: ExteriorAccessoriesStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'MechanicalIssues',
        component: MechanicalStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'Tires',
        component: TiresStageComponent,
        data: { breadcrumb: '' }
      },
      {
        path: 'RoadTest',
        component: RoadTestStageComponent,
        data: { breadcrumb: '' }
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExaminationWorkflowRoutingModule { }
