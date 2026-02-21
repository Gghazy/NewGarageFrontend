import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientResourcesRoutingModule } from './client-resources-routing-module';
import { ClientResourceList } from './client-resource-list/client-resource-list';
import { SharedModule } from 'src/app/shared/shared-module';


@NgModule({
  declarations: [ClientResourceList],
  imports: [
    CommonModule,
    ClientResourcesRoutingModule,
    SharedModule
  ]
})
export class ClientResourcesModule { }
