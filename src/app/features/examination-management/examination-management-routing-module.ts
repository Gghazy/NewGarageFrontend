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
        path: 'mech-parts',
        loadChildren: () =>
          import('./mech-parts/mech-parts-module').then(m => m.MechPartsModule),
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
        path: 'mech-issues',
        loadChildren: () =>
          import('./mech-issue/mech-issue-module').then(m => m.MechIssueModule),
      },
      {
        path: 'mech-part-types',
        loadChildren: () =>
          import('./mech-part-type/mech-part-type-module').then(m => m.MechPartTypeModule),
      },
      {
        path: 'inside-and-decor-parts',
        loadChildren: () =>
          import('./inside-and-decor-part/inside-and-decor-part-module').then(m => m.InsideAndDecorPartModule),
      },
      {
        path: 'inside-and-decor-part-issues',
        loadChildren: () =>
          import('./inside-and-decor-part-issue/inside-and-decor-part-issue-module').then(m => m.InsideAndDecorPartIssueModule),
      },
      {
        path: 'interior-body-parts',
        loadChildren: () =>
          import('./interior-body-part/interior-body-part-module').then(m => m.InteriorBodyPartModule),
      },
      {
        path: 'exterior-body-parts',
        loadChildren: () =>
          import('./exterior-body-part/exterior-body-part-module').then(m => m.ExteriorBodyPartModule),
      },
      {
        path: 'road-test-issue-types',
        loadChildren: () =>
          import('./road-test-issue-type/road-test-issue-type-module').then(m => m.RoadTestIssueTypeModule),
      },
      {
        path: 'accessory-parts',
        loadChildren: () =>
          import('./accessory-part/accessory-part-module').then(m => m.AccessoryPartModule),
      }

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExaminationManagementRoutingModule { }
