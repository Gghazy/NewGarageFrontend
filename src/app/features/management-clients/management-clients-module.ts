import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagementClientsRoutingModule } from './management-clients-routing-module';
import { ManagementClients } from './management-clients';


@NgModule({
  declarations: [ManagementClients],
  imports: [
    CommonModule,
    ManagementClientsRoutingModule
  ]
})
export class ManagementClientsModule { }
