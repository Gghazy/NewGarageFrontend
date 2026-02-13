import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { InsideAndDecorPartList } from './inside-and-decor-part-list/inside-and-decor-part-list';

const routes: Routes = [
    {
        path: '',
        component: InsideAndDecorPartList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.INSIDE_AND_DECOR_PART',
          permissions: ['insideAndDecorPart.read'],
          permissionMode: 'any'
        }
    
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsideAndDecorPartRoutingModule { }
