import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { ExteriorBodyPartList } from './exterior-body-part-list/exterior-body-part-list';

const routes: Routes = [
    {
        path: '',
        component: ExteriorBodyPartList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EXTERIOR_BODY_PART',
          permissions: ['exteriorBodyPart.read'],
          permissionMode: 'any'
        }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExteriorBodyPartRoutingModule { }
