import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { RoleForm } from './role-form/role-form';
import { RoleList } from './role-list/role-list';
import { RolesLayout } from './roles-layout';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: RolesLayout,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.ROLES',
      permissions: ['roles.read'],
      permissionMode: 'any'
    },
    children: [
      {
        path: '',
        component: RoleList,
        data: {
          permissions: ['roles.read'],
          permissionMode: 'any',
          breadcrumb: '',

        }
      },
      {
        path: 'form',
        component: RoleForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.ADD_ROLE',
          permissions: ['roles.create'],
          permissionMode: 'any'
        }
      },
      {
        path: 'form/:id',
        component: RoleForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.EDIT_ROLE',
          permissions: ['roles.update'],
          permissionMode: 'any'
        }
      }
    ]
  }
];




@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }
