import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { SensorIssuesList } from './sensor-issues-list/sensor-issues-list';

const routes: Routes = [
    {
    path: '',
    component: SensorIssuesList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'SENSOR_ISSUES.NAME', 
      permissions: ['sensorIssue.read'],
      permissionMode: 'any'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SensorIssuesRoutingModule { }
