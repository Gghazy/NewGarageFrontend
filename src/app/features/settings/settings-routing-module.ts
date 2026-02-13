import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Settings } from './settings';
import { authGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: Settings,
    canActivate: [authGuard],
    children: [
      {
        path: 'car-marks',
        loadChildren: () =>
          import('./car-mark/car-mark-module').then(m => m.CarMarkModule),
      },
      {
        path: 'manufacturers',
        loadChildren: () =>
          import('./manufacturer/manufacturer-module').then(m => m.ManufacturerModule),
      },
      {
        path: 'services',
        loadChildren: () =>
          import('./service/service-module').then(m => m.ServiceModule),
      },
      {
        path: 'service-prices',
        loadChildren: () => import('./service-price/service-price-module').then(m => m.ServicePriceModule)
      },
      {
        path: 'cranes',
        loadChildren: () =>
          import('./crane/crane-module').then(m => m.CraneModule),
      },
      {
        path: 'terms',
        loadChildren: () =>
          import('./terms/terms-module').then(m => m.TermsModule),
      },
      {
        path: 'branches',
        loadChildren: () => import('./branches/branches-module').then(m => m.BranchesModule)
      }


    ]
  }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
