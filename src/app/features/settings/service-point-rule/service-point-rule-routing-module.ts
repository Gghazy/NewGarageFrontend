import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicePointRuleList } from './service-point-rule-list/service-point-rule-list';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: ServicePointRuleList,
    canActivate: [permissionGuard],
    data: {
      breadcrumb: 'BREADCRUMB.SERVICE_POINT_RULE',
      permissions: ['servicePointRule.read'],
      permissionMode: 'any'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicePointRuleRoutingModule { }
