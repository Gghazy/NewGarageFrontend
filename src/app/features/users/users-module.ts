import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing-module';
import { Users } from './users';

@NgModule({
  declarations: [Users],
  imports: [
    CommonModule,
    UsersRoutingModule
  ]
})
export class UsersModule { }
