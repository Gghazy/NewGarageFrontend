import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RoleRoutingModule } from './role-routing-module';
import { RoleForm } from './role-form/role-form';
import { SharedModule } from 'src/app/shared/shared-module';
import { RoleList } from './role-list/role-list';


@NgModule({
  declarations: [RoleForm,RoleList],
  imports: [
    CommonModule,
    RoleRoutingModule,
    SharedModule
  ]
})
export class RoleModule { }
