import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarMarkList } from './car-mark-list/car-mark-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: CarMarkList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.CAR_MARKS',
      permissions: ['carMark.read'],
      permissionMode: 'any'
    }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CarMarkRoutingModule { }
