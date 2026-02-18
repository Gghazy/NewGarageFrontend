import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from 'src/app/core/guards/auth.guard';
import { Users } from './users';

const routes: Routes = [


    {
      path: '',
      component: Users,
      canActivate: [authGuard],
      children: [
        {
          path: 'roles',
          loadChildren: () =>
            import('./role/role-module').then(m => m.RoleModule),
        }, 
        {
          path: 'employees',
          loadChildren: () =>
            import('./employee/employee-module').then(m => m.EmployeeModule),
        }, 
  
      ]
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
