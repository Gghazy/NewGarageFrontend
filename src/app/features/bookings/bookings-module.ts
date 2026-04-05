import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared-module';
import { BookingsRoutingModule } from './bookings-routing-module';
import { BookingService } from './booking.service';
import { BookingsLayout } from './bookings-layout';
import { BookingList } from './booking-list/booking-list';
import { BookingForm } from './booking-form/booking-form';
import { BookingDetail } from './booking-detail/booking-detail';

@NgModule({
  declarations: [
    BookingsLayout,
    BookingList,
    BookingForm,
    BookingDetail,
  ],
  imports: [
    CommonModule,
    SharedModule,
    BookingsRoutingModule,
  ],
  providers: [
    BookingService,
  ],
})
export class BookingsModule {}
