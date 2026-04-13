export interface InvoiceHistoryDto {
  id: string;
  action: string;
  details?: string;
  performedById?: string;
  performedByNameAr?: string;
  performedByNameEn?: string;
  createdAtUtc: string;
}

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
  unitPrice: number;
  totalPrice: number;
  currency: string;
  serviceId?: string;
  serviceNameAr?: string;
  serviceNameEn?: string;
  adjustmentAmount: number;
}

export interface ConsolidatedItemDto {
  description: string;
  serviceNameAr?: string;
  serviceNameEn?: string;
  unitPrice: number;
  totalPrice: number;
  currency: string;
}

export interface ConsolidatedInvoiceData {
  clientNameAr: string;
  clientNameEn: string;
  clientPhone: string;
  branchNameAr?: string;
  branchNameEn?: string;
  manufacturerNameAr?: string;
  manufacturerNameEn?: string;
  carMarkNameAr?: string;
  carMarkNameEn?: string;
  year?: number;
  color?: string;
  vin?: string;
  plateLetters?: string;
  plateNumbers?: string;
  mileage?: number;
  mileageUnit?: string;
  items: ConsolidatedItemDto[];
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  totalWithTax: number;
  totalPaid: number;
  balance: number;
  currency: string;
  invoiceCount: number;
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
  netTotal: number;
  currency: string;

  // Items
  items: InvoiceItemDto[];

  // Payments
  payments: InvoicePaymentDto[];

  createdAtUtc: string;
}
