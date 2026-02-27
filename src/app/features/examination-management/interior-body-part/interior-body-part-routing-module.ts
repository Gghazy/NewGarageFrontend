import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { InteriorBodyPartList } from './interior-body-part-list/interior-body-part-list';

const routes: Routes = [
    {
        path: '',
        component: InteriorBodyPartList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.INTERIOR_BODY_PART',
          permissions: ['interiorBodyPart.read'],
          permissionMode: 'any'
        }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteriorBodyPartRoutingModule { }
