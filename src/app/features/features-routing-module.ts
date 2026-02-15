import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FeaturesHome } from './home/features-home';
import { FeaturesComponent } from './features.component';
import { authGuard } from '../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: FeaturesComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: FeaturesHome },
    
      {
        path: 'settings',
        loadChildren: () =>
          import('./settings/settings-module').then(m => m.SettingsModule),
      },
      {
        path: 'examination-management',
        loadChildren: () =>
          import('./examination-management/examination-management-module').then(m => m.ExaminationManagementModule),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./users/users-module').then(m => m.UsersModule),
      },

    ]
  }


  ,
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FeaturesRoutingModule { }
