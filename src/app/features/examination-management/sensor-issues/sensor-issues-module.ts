import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorIssuesRoutingModule } from './sensor-issues-routing-module';
import { SharedModule } from 'src/app/shared/shared-module';
import { SensorIssuesList } from './sensor-issues-list/sensor-issues-list';
import { SensorIssuesForm } from './sensor-issues-form/sensor-issues-form';


@NgModule({
   declarations: [SensorIssuesList, SensorIssuesForm],
  imports: [
    CommonModule,
    SensorIssuesRoutingModule,
    SharedModule
  ]
})
export class SensorIssuesModule { }
