import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { ManufacturerList } from './manufacturer-list/manufacturer-list';

const routes: Routes = [
  {
    path: '',
    component: ManufacturerList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.MANUFACTURERS',
      permissions: ['manufacturer.read'],
      permissionMode: 'any'
    }

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManufacturerRoutingModule { }
