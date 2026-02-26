import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceDto } from 'src/app/shared/Models/invoices/invoice-dto';

@Injectable({ providedIn: 'root' })
export class InvoicePrintService {
  constructor(private translate: TranslateService) {}

  print(inv: InvoiceDto): void {
    const lang = this.translate.currentLang || 'ar';
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const t = (key: string) => this.translate.instant(key);

    const itemsRows = inv.items.map((item, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${item.serviceNameAr || item.description}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:center">${item.unitPrice.toFixed(2)}</td>
        <td style="text-align:center">${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const paymentsRows = inv.payments.map((p, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${p.createdAtUtc ? new Date(p.createdAtUtc).toLocaleDateString() : '—'}</td>
        <td style="text-align:center"><span style="color:${p.type === 'Refund' ? '#dc3545' : '#198754'}">${t('INVOICES.PAYMENTS.TYPES.' + p.type)}</span></td>
        <td style="text-align:center">${p.amount.toFixed(2)} ${p.currency}</td>
        <td>${t('INVOICES.PAYMENTS.METHODS.' + p.method)}</td>
      </tr>
    `).join('');

    const html = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${t('INVOICES.FORM.TITLE_DETAILS')} - ${inv.invoiceNumber || inv.id}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #333; padding: 20px; direction: ${dir}; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 12px; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header .meta { font-size: 12px; color: #666; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #fff; }
        .bg-issued { background: #0d6efd; } .bg-paid { background: #198754; } .bg-cancelled { background: #dc3545; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .info-grid .item label { font-size: 11px; color: #888; display: block; } .info-grid .item span { font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }
        .section-title { font-size: 14px; font-weight: 700; margin: 16px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .summary .box { border: 1px solid #ddd; border-radius: 4px; padding: 8px; text-align: center; }
        .summary .box label { font-size: 11px; color: #888; display: block; } .summary .box .val { font-size: 15px; font-weight: 700; }
        .text-success { color: #198754; } .text-danger { color: #dc3545; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${t('INVOICES.FORM.TITLE_DETAILS')}</h1>
          <div class="meta">${inv.invoiceNumber ? '#' + inv.invoiceNumber : ''}</div>
        </div>
        <div style="text-align:${isAr ? 'left' : 'right'}">
          <span class="badge ${inv.status === 'Issued' ? 'bg-issued' : inv.status === 'Paid' ? 'bg-paid' : 'bg-cancelled'}">
            ${t('INVOICES.LIST.STATUSES.' + inv.status)}
          </span>
          <div class="meta" style="margin-top:4px">${inv.createdAtUtc ? new Date(inv.createdAtUtc).toLocaleDateString() : ''}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="item"><label>${t('INVOICES.FORM.CLIENT')}</label><span>${inv.clientNameAr}</span><br><small>${inv.clientPhone}</small></div>
        <div class="item"><label>${t('INVOICES.FORM.BRANCH')}</label><span>${inv.branchNameAr}</span></div>
        <div class="item"><label>${t('INVOICES.FORM.DUE_DATE')}</label><span>${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</span></div>
      </div>
      ${inv.notes ? '<div style="margin-bottom:12px"><label style="font-size:11px;color:#888">' + t('INVOICES.FORM.NOTES') + '</label><div>' + inv.notes + '</div></div>' : ''}

      <div class="section-title">${t('INVOICES.ITEMS.TITLE')}</div>
      <table>
        <thead><tr>
          <th style="width:36px">#</th>
          <th>${t('INVOICES.ITEMS.DESCRIPTION')}</th>
          <th>${t('INVOICES.ITEMS.QUANTITY')}</th>
          <th>${t('INVOICES.ITEMS.UNIT_PRICE')}</th>
          <th>${t('INVOICES.ITEMS.TOTAL')}</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <div class="summary">
        <div class="box"><label>${t('INVOICES.PAYMENTS.SUB_TOTAL')}</label><div class="val">${inv.subTotal.toFixed(2)}</div></div>
        <div class="box"><label>${t('INVOICES.PAYMENTS.DISCOUNT')}</label><div class="val text-danger">${inv.discountAmount.toFixed(2)}</div></div>
        <div class="box"><label>${t('INVOICES.PAYMENTS.TAX_AMOUNT')} (${(inv.taxRate * 100).toFixed(0)}%)</label><div class="val">${inv.taxAmount.toFixed(2)}</div></div>
        <div class="box" style="background:#f5f5f5"><label>${t('INVOICES.PAYMENTS.TOTAL_WITH_TAX')}</label><div class="val">${inv.totalWithTax.toFixed(2)} ${inv.currency}</div></div>
        <div class="box"><label>${t('INVOICES.PAYMENTS.TOTAL_PAID')}</label><div class="val text-success">${inv.totalPaid.toFixed(2)}</div></div>
        <div class="box"><label>${t('INVOICES.PAYMENTS.TOTAL_REFUNDED')}</label><div class="val text-danger">${inv.totalRefunded.toFixed(2)}</div></div>
        <div class="box"><label>${t('INVOICES.PAYMENTS.BALANCE')}</label><div class="val ${inv.balance > 0 ? 'text-danger' : 'text-success'}">${inv.balance.toFixed(2)} ${inv.currency}</div></div>
      </div>

      ${inv.payments.length > 0 ? `
        <div class="section-title">${t('INVOICES.PAYMENTS.TITLE')}</div>
        <table>
          <thead><tr>
            <th style="width:36px">#</th>
            <th>${t('INVOICES.PAYMENTS.DATE')}</th>
            <th>${t('INVOICES.PAYMENTS.TYPE')}</th>
            <th>${t('INVOICES.PAYMENTS.AMOUNT')}</th>
            <th>${t('INVOICES.PAYMENTS.METHOD')}</th>
          </tr></thead>
          <tbody>${paymentsRows}</tbody>
        </table>
      ` : ''}

    </body>
    </html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }
}
