import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { RoadTestIssueTypeList } from './road-test-issue-type-list/road-test-issue-type-list';

const routes: Routes = [
    {
        path: '',
        component: RoadTestIssueTypeList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.ROAD_TEST_ISSUE_TYPES',
          permissions: ['roadTestIssueType.read'],
          permissionMode: 'any'
        }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoadTestIssueTypeRoutingModule { }
