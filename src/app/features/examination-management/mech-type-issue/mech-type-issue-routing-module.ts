import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MechTypeIssueList } from './mech-type-issue-list/mech-type-issue-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
      path: '',
      component: MechTypeIssueList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.MECH_TYPE_ISSUES',
        permissions: ['mechIssueType.read'],
        permissionMode: 'any'
      }
  
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MechTypeIssueRoutingModule { }
