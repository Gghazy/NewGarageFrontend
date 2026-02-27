import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MechPartTypeList } from './mech-part-type-list/mech-part-type-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
      path: '',
      component: MechPartTypeList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.MECH_PART_TYPES',
        permissions: ['mechPartType.read'],
        permissionMode: 'any'
      }

    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MechPartTypeRoutingModule { }
