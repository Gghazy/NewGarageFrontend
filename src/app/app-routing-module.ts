import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { UnauthGuardService } from './core/guards/unauth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    loadChildren: () => import('./authentication/authentication-module').then((m) => m.AuthenticationModule),
    canActivate: [UnauthGuardService],
  },
  {
    path: 'features',
    loadChildren: () => import('./features/features-module').then((m) => m.FeaturesModule),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'auth/login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
