export interface InvoicePaymentDto {
  id: string;
  amount: number;
  currency: string;
  methodId: string;
  methodNameAr: string;
  methodNameEn: string;
  type: string;
  notes?: string;
  createdAtUtc: string;
}

export interface InvoiceItemDto {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  serviceId?: string;
  serviceNameAr?: string;
  serviceNameEn?: string;
}

export interface RelatedInvoiceDto {
  id: string;
  invoiceNumber?: string;
  type: string;
  status: string;
  totalWithTax: number;
  currency: string;
  createdAtUtc: string;
}

export interface InvoiceDto {
  id: string;
  invoiceNumber?: string;
  examinationId?: string;
  originalInvoiceId?: string;
  type: string;
  status: string;

  // Client
  clientId: string;
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;

  // Branch
  branchId: string;
  branchNameAr: string;
  branchNameEn: string;

  // Meta
  notes?: string;
  dueDate?: string;

  // Financials
  subTotal: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalWithTax: number;
  currency: string;
  totalPaid: number;
  totalRefunded: number;
  balance: number;

  // Items
  items: InvoiceItemDto[];

  // Payments
  payments: InvoicePaymentDto[];

  // Related invoices (Refund / Adjustment)
  relatedInvoices: RelatedInvoiceDto[];

  createdAtUtc: string;
}
