import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InteriorBodyIssueList } from './interior-body-issue-list/interior-body-issue-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
    {
      path: '',
      component: InteriorBodyIssueList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.INTERIOR_BODY_ISSUES',
        permissions: ['interiorBodyIssue.read'],
        permissionMode: 'any'
      }
  
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteriorBodyIssueRoutingModule { }
