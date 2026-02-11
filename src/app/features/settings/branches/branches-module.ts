import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BranchesRoutingModule } from './branches-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { BranchList } from './branch-list/branch-list';
import { BranchForm } from './branch-form/branch-form';


@NgModule({
  declarations: [BranchList,BranchForm],
  imports: [
    CommonModule,
    BranchesRoutingModule,
    SharedModule
  ]
})
export class BranchesModule { }
