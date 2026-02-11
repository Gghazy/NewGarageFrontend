import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InteriorIssueList } from './interior-issue-list/interior-issue-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: InteriorIssueList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.INTERIOR_ISSUES',
      permissions: ['interiorIssue.read'],
      permissionMode: 'any'
    }

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteriorIssueRoutingModule { }
