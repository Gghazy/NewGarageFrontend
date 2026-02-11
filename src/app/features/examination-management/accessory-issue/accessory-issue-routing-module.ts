import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { AccessoryIssueList } from './accessory-issue-list/accessory-issue-list';

const routes: Routes = [
    {
          path: '',
          component: AccessoryIssueList,
          canActivate: [permissionGuard],
          data: {
            breadcrumb: 'BREADCRUMB.ACCESSORY_ISSUES',
            permissions: ['accessoryIssue.read'],
            permissionMode: 'any'
          }
      
        },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessoryIssueRoutingModule { }
