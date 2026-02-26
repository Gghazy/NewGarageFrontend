import { Pipe, PipeTransform } from '@angular/core';

const EXAMINATION_BADGE: Record<string, string> = {
  Draft:      'bg-secondary',
  Pending:    'bg-warning',
  InProgress: 'bg-primary',
  Completed:  'bg-success',
  Delivered:  'bg-info',
  Cancelled:  'bg-danger',
};

const INVOICE_BADGE: Record<string, string> = {
  Issued:            'bg-primary',
  Paid:              'bg-success',
  Cancelled:         'bg-danger',
  PartiallyRefunded: 'bg-info',
  Refunded:          'bg-dark',
};

const INVOICE_TYPE_BADGE: Record<string, string> = {
  Invoice:    'bg-primary',
  Refund:     'bg-danger',
  Adjustment: 'bg-warning text-dark',
};

const MAPS: Record<string, Record<string, string>> = {
  examination: EXAMINATION_BADGE,
  invoice:     INVOICE_BADGE,
  invoiceType: INVOICE_TYPE_BADGE,
};

@Pipe({ name: 'statusBadge', standalone: false })
export class StatusBadgePipe implements PipeTransform {
  transform(status: string | undefined | null, category: string): string {
    if (!status) return '';
    return MAPS[category]?.[status] ?? 'bg-secondary';
  }
}
