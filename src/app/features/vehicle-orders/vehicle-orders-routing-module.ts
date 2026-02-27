import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
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
        canActivate: [permissionGuard],
        data: {
          breadcrumb: '',
          permissions: ['examination.read'],
          permissionMode: 'any'
        }
      },
      {
        path: 'new',
        component: VehicleOrderForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.NEW_EXAMINATION',
          permissions: ['examination.create'],
          permissionMode: 'any'
        }
      },
      {
        path: ':id/details',
        component: ExaminationDetail,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EXAM_DETAILS',
          permissions: ['examination.read'],
          permissionMode: 'any'
        }
      },
      {
        path: ':id/workflow',
        loadChildren: () =>
          import('./examination-workflow/examination-workflow-module').then(m => m.ExaminationWorkflowModule),
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EXAM_WORKFLOW',
          permissions: ['examination.read', 'examination.update'],
          permissionMode: 'any'
        }
      },
      {
        path: ':id',
        component: VehicleOrderForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EDIT_EXAMINATION',
          permissions: ['examination.update'],
          permissionMode: 'any'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleOrdersRoutingModule {}
