import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessoryPartRoutingModule } from './accessory-part-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { AccessoryPartList } from './accessory-part-list/accessory-part-list';

@NgModule({
  declarations: [AccessoryPartList],
  imports: [CommonModule, AccessoryPartRoutingModule, SharedModule]
})
export class AccessoryPartModule { }
