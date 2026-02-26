export interface InvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
  serviceId?: string;
}

export interface CreateInvoiceRequest {
  clientId: string;
  branchId: string;
  notes?: string;
  dueDate?: string;
  items: InvoiceItemRequest[];
}

export interface UpdateInvoiceRequest {
  clientId: string;
  branchId: string;
  notes?: string;
  dueDate?: string;
  items?: InvoiceItemRequest[];
}
