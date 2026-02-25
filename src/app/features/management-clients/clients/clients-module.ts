import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing-module';
import { ClientList } from './client-list/client-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [
    ClientList,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ClientsRoutingModule
  ]
})
export class ClientsModule { }
