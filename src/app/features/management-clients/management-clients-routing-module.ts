import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'clients',
    loadChildren: () =>
      import('./clients/clients-module').then(m => m.ClientsModule),
  },
  {
    path: 'client-resources',
    loadChildren: () =>
      import('./client-resources/client-resources-module').then(m => m.ClientResourcesModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagementClientsRoutingModule { }
