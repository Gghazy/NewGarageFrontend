import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MechIssueList } from './mech-issue-list/mech-issue-list';

const routes: Routes = [
  {
    path: '',
    component: MechIssueList,
    data: {
      breadcrumb: 'BREADCRUMB.MECH_ISSUES',
      permissions: ['mechIssue.read'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MechIssueRoutingModule {}
