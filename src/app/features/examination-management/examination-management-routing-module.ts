import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { ExaminationManagement } from './examination-management';

const routes: Routes = [
  {
    path: '',
    component: ExaminationManagement,
    canActivate: [authGuard],
    children: [
      {
        path: 'interior-issues',
        loadChildren: () => import('./interior-issue/interior-issue-module').then(m => m.InteriorIssueModule)
      },
      {
        path: 'sensor-issues',
        loadChildren: () =>
          import('./sensor-issues/sensor-issues-module').then(m => m.SensorIssuesModule),
      },
      {
        path: 'mech-issues',
        loadChildren: () =>
          import('./mech-issues/mech-issues-module').then(m => m.MechIssuesModule),
      },
      {
        path: 'interior-body-issues',
        loadChildren: () =>
          import('./interior-body-issue/interior-body-issue-module').then(m => m.InteriorBodyIssueModule),
      },
      {
        path: 'exterior-body-issues',
        loadChildren: () =>
          import('./exterior-body-issue/exterior-body-issue-module').then(m => m.ExteriorBodyIssueModule),
      },
      {
        path: 'accessory-issues',
        loadChildren: () =>
          import('./accessory-issue/accessory-issue-module').then(m => m.AccessoryIssueModule),
      },
      {
        path: 'road-test-issues',
        loadChildren: () =>
          import('./road-test-issue/road-test-issue-module').then(m => m.RoadTestIssueModule),
      },
      {
        path: 'mech-type-issues',
        loadChildren: () =>
          import('./mech-type-issue/mech-type-issue-module').then(m => m.MechTypeIssueModule),
      },
      {
        path: 'inside-and-decor-parts',
        loadChildren: () =>
          import('./inside-and-decor-part/inside-and-decor-part-module').then(m => m.InsideAndDecorPartModule),
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExaminationManagementRoutingModule { }
