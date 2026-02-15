import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { RoleForm } from './role-form/role-form';
import { RoleList } from './role-list/role-list';

const routes: Routes = [
      {
        path: '',
        component: RoleList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.ROLES',
          permissions: ['role.read'],
          permissionMode: 'any'
        }
    
      },
      {
        path: 'create',
        component: RoleForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.ADD_ROLE',
          permissions: ['role.create'],
          permissionMode: 'any'
        }
    
      },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
