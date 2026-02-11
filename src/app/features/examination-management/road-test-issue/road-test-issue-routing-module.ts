import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { RoadTestIssueList } from './road-test-issue-list/road-test-issue-list';

const routes: Routes = [
     {
      path: '',
      component: RoadTestIssueList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'ROAD_TEST_ISSUE.NAME', 
        permissions: ['roadTestIssue.read'],
        permissionMode: 'any'
      }
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoadTestIssueRoutingModule { }
