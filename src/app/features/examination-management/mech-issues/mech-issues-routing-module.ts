import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MechIssueList } from './mech-issue-list/mech-issue-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: MechIssueList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.MECH_ISSUES',
      permissions: ['mechIssue.read'],
      permissionMode: 'any'
    }

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MechIssuesRoutingModule { }
