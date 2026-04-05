import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse, PaginatedResponse } from 'src/app/shared/Models/api-response';
import { BookingDto, BookingHistoryDto } from 'src/app/shared/Models/bookings/booking-dto';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';

@Injectable()
export class BookingService {
  constructor(private api: ApiService) {}

  paginate(criteria: SearchCriteria): Observable<PaginatedResponse<BookingDto>> {
    return this.api.post<PaginatedResponse<BookingDto>>('Bookings/pagination', criteria);
  }

  getById(id: string): Observable<ApiResponse<BookingDto>> {
    return this.api.get<ApiResponse<BookingDto>>(`Bookings/${id}`);
  }

  create(payload: any): Observable<ApiResponse<string>> {
    return this.api.post<ApiResponse<string>>('Bookings', payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.api.put<any>(`Bookings/${id}`, payload);
  }

  delete(id: string): Observable<any> {
    return this.api.delete<any>(`Bookings/${id}`);
  }

  confirm(id: string): Observable<any> {
    return this.api.post<any>(`Bookings/${id}/confirm`, {});
  }

  cancel(id: string): Observable<any> {
    return this.api.post<any>(`Bookings/${id}/cancel`, {});
  }

  convert(id: string): Observable<ApiResponse<string>> {
    return this.api.post<ApiResponse<string>>(`Bookings/${id}/convert`, {});
  }

  getHistory(id: string): Observable<ApiResponse<BookingHistoryDto[]>> {
    return this.api.get<ApiResponse<BookingHistoryDto[]>>(`Bookings/${id}/history`);
  }

  getByExaminationId(examinationId: string): Observable<ApiResponse<BookingDto>> {
    return this.api.get<ApiResponse<BookingDto>>(`Bookings/by-examination/${examinationId}`);
  }
}
