import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from 'src/app/core/services/custom.service';
import { ApiResponse, PaginatedResponse } from 'src/app/shared/Models/api-response';
import { ConsolidatedInvoiceData, InvoiceDto, InvoiceHistoryDto } from 'src/app/shared/Models/invoices/invoice-dto';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';

@Injectable()
export class InvoiceService {
  constructor(private api: ApiService) {}

  getById(id: string): Observable<ApiResponse<InvoiceDto>> {
    return this.api.get<ApiResponse<InvoiceDto>>(`Invoices/${id}`);
  }

  getHistory(id: string): Observable<ApiResponse<InvoiceHistoryDto[]>> {
    return this.api.get<ApiResponse<InvoiceHistoryDto[]>>(`Invoices/${id}/history`);
  }

  getByExamination(examinationId: string): Observable<ApiResponse<InvoiceDto[]>> {
    return this.api.get<ApiResponse<InvoiceDto[]>>(`Invoices/by-examination/${examinationId}`);
  }

  getConsolidated(examinationId: string): Observable<ApiResponse<ConsolidatedInvoiceData>> {
    return this.api.get<ApiResponse<ConsolidatedInvoiceData>>(`Invoices/consolidated/${examinationId}`);
  }

  paginate(criteria: SearchCriteria): Observable<PaginatedResponse<InvoiceDto>> {
    return this.api.post<PaginatedResponse<InvoiceDto>>('Invoices/pagination', criteria);
  }

  addPayment(id: string, payload: any): Observable<any> {
    return this.api.post<any>(`Invoices/${id}/payments`, payload);
  }

  addRefund(id: string, payload: any): Observable<any> {
    return this.api.post<any>(`Invoices/${id}/refunds`, payload);
  }

  setDiscount(id: string, amount: number): Observable<any> {
    return this.api.put<any>(`Invoices/${id}/discount`, amount);
  }

  cancel(id: string): Observable<any> {
    return this.api.post<any>(`Invoices/${id}/cancel`, {});
  }

  delete(id: string): Observable<any> {
    return this.api.delete<any>(`Invoices/${id}`);
  }
}
