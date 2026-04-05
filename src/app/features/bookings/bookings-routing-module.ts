import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookingList } from './booking-list/booking-list';
import { BookingForm } from './booking-form/booking-form';
import { BookingDetail } from './booking-detail/booking-detail';
import { BookingsLayout } from './bookings-layout';
import { permissionGuard } from 'src/app/core/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: BookingsLayout,
    data: { breadcrumb: 'BREADCRUMB.BOOKINGS' },
    children: [
      {
        path: '',
        component: BookingList,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: '',
          permissions: ['booking.read'],
          permissionMode: 'any',
        },
      },
      {
        path: 'new',
        component: BookingForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.BOOKING_NEW',
          permissions: ['booking.create'],
          permissionMode: 'any',
        },
      },
      {
        path: ':id/detail',
        component: BookingDetail,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.BOOKING_DETAIL',
          permissions: ['booking.read'],
          permissionMode: 'any',
        },
      },
      {
        path: ':id/edit',
        component: BookingForm,
        canActivate: [permissionGuard],
        data: {
          breadcrumb: 'BREADCRUMB.BOOKING_EDIT',
          permissions: ['booking.update'],
          permissionMode: 'any',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BookingsRoutingModule {}
