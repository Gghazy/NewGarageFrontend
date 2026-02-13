import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { TemrForm } from './temr-form/temr-form';

const routes: Routes = [
    {
      path: '',
      component: TemrForm,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.TERMS',
        permissions: ['term.create'],
        permissionMode: 'any'
      }
  
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TermsRoutingModule { }
