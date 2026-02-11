import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExteriorBodyIssueList } from './exterior-body-issue-list/exterior-body-issue-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
      {
        path: '',
        component: ExteriorBodyIssueList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EXTERIOR_BODY_ISSUES',
          permissions: ['exteriorBodyIssue.read'],
          permissionMode: 'any'
        }
    
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExteriorBodyIssueRoutingModule { }
