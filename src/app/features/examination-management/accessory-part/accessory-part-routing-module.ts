import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from 'src/app/core/guards/permission.guard';
import { AccessoryPartList } from './accessory-part-list/accessory-part-list';

const routes: Routes = [
    {
        path: '',
        component: AccessoryPartList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.ACCESSORY_PART',
          permissions: ['accessoryPart.read'],
          permissionMode: 'any'
        }
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccessoryPartRoutingModule { }
