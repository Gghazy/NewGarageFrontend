import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchList } from './branch-list/branch-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: BranchList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.BRANCHES',
      permissions: ['branches.read'],
      permissionMode: 'any'
    }

  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BranchesRoutingModule { }
