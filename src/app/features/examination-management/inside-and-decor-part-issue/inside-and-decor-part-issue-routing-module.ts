import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { InsideAndDecorPartIssueList } from './inside-and-decor-part-issue-list/inside-and-decor-part-issue-list';

const routes: Routes = [
    {
        path: '',
        component: InsideAndDecorPartIssueList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.INSIDE_AND_DECOR_PART_ISSUE',
          permissions: ['insideAndDecorPartIssue.read'],
          permissionMode: 'any'
        }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsideAndDecorPartIssueRoutingModule { }
