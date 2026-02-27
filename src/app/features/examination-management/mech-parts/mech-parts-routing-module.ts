import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MechPartList } from './mech-part-list/mech-part-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: MechPartList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.MECH_PARTS',
      permissions: ['mechPart.read'],
      permissionMode: 'any'
    }

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MechPartsRoutingModule { }
