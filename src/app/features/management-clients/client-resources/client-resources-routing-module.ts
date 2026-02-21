import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { ClientResourceList } from './client-resource-list/client-resource-list';

const routes: Routes = [
    {
      path: '',
      component: ClientResourceList,
      canActivate: [permissionGuard],
      data: {
        breadcrumb: 'BREADCRUMB.CLIENT_RESOURCES',
        permissions: ['clientResource.read'],
        permissionMode: 'any'
      }
  
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientResourcesRoutingModule { }
