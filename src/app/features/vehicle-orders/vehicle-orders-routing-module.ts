import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExaminationDetail } from './examination-detail/examination-detail';
import { VehicleOrderForm } from './vehicle-order-form/vehicle-order-form';
import { VehicleOrderList } from './vehicle-order-list/vehicle-order-list';
import { VehicleOrdersLayout } from './vehicle-orders-layout';

const routes: Routes = [
  {
    path: '',
    component: VehicleOrdersLayout,
    data: { breadcrumb: 'BREADCRUMB.EXAMINATIONS' },
    children: [
      {
        path: '',
        component: VehicleOrderList,
        data: { breadcrumb: '' }
      },
      {
        path: 'new',
        component: VehicleOrderForm,
        data: { breadcrumb: 'BREADCRUMB.NEW_EXAMINATION' }
      },
      {
        path: ':id/details',
        component: ExaminationDetail,
        data: { breadcrumb: 'BREADCRUMB.EXAM_DETAILS' }
      },
      {
        path: ':id/workflow',
        loadChildren: () =>
          import('./examination-workflow/examination-workflow-module').then(m => m.ExaminationWorkflowModule),
        data: { breadcrumb: 'BREADCRUMB.EXAM_WORKFLOW' }
      },
      {
        path: ':id',
        component: VehicleOrderForm,
        data: { breadcrumb: 'BREADCRUMB.EDIT_EXAMINATION' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleOrdersRoutingModule {}
