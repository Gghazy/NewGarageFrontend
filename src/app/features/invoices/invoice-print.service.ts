import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { InvoiceDto, ConsolidatedInvoiceData } from 'src/app/shared/Models/invoices/invoice-dto';
import { AppConfig } from 'src/app/core/config/config';
import { CONFIG_KEYS } from 'src/app/core/constants/app.constants';
import * as QRCode from 'qrcode';

@Injectable()
export class InvoicePrintService {
  constructor(
    private translate: TranslateService,
    private appConfig: AppConfig,
  ) {}

  private escapeHtml(str: string | null | undefined): string {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  async print(inv: InvoiceDto): Promise<void> {
    const lang = this.translate.currentLang || 'ar';
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const t = (key: string) => this.translate.instant(key);

    // Generate QR code
    const baseUrl = this.appConfig.get(CONFIG_KEYS.PATH_API);
    const publicUrl = `${baseUrl}api/Invoices/${inv.id}/view?lang=${lang}`;
    const qrDataUrl = await QRCode.toDataURL(publicUrl, { width: 120, margin: 1 });

    const createdDate = inv.createdAtUtc ? new Date(inv.createdAtUtc) : null;
    const locale = isAr ? 'ar-SA' : 'en-US';
    const dateStr = createdDate ? createdDate.toLocaleDateString(locale) : '—';
    const timeStr = createdDate ? createdDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) : '';

    const itemsRows = inv.items.map((item, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${this.escapeHtml(isAr ? (item.serviceNameAr || item.description) : (item.serviceNameEn || item.description))}</td>
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
        <td>${this.escapeHtml(isAr ? p.methodNameAr : p.methodNameEn)}</td>
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
        body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #333; padding: 24px; direction: ${dir}; max-width: 800px; margin: 0 auto; }

        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #ddd; }
        .header-center { text-align: center; flex: 1; }
        .header-center h1 { font-size: 22px; margin-bottom: 6px; }
        .header-center .meta { font-size: 12px; color: #666; line-height: 1.6; }
        .qr-code img { width: 120px; height: 120px; }

        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid #eee; }
        .info-row .label { color: #888; font-size: 12px; }
        .info-row .value { font-weight: 600; font-size: 13px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #ddd; padding: 7px 10px; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }

        .section-title { font-size: 14px; font-weight: 700; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }

        .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .summary .box { border: 1px solid #ddd; border-radius: 6px; padding: 10px; text-align: center; }
        .summary .box .lbl { font-size: 11px; color: #888; display: block; }
        .summary .box .val { font-size: 15px; font-weight: 700; }

        .badge { display: inline-block; padding: 2px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; color: #fff; }
        .bg-issued { background: #0d6efd; } .bg-paid { background: #198754; } .bg-cancelled { background: #dc3545; }
        .text-success { color: #198754; } .text-danger { color: #dc3545; }

        .vat-note { text-align: center; color: #dc3545; font-size: 12px; margin: 8px 0 16px; }

        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>

      <!-- Header with QR code -->
      <div class="header">
        <div class="qr-code">
          <img src="${qrDataUrl}" alt="QR Code" />
        </div>
        <div class="header-center">
          <h1>${t('INVOICES.PRINT.INVOICE')}</h1>
          <div class="meta">
            ${t('INVOICES.PRINT.INVOICE_NUMBER')}: ${inv.invoiceNumber || '—'}<br>
            ${t('INVOICES.PRINT.ISSUE_DATE')}: ${dateStr}<br>
            ${timeStr ? t('INVOICES.PRINT.ISSUE_TIME') + ': ' + timeStr : ''}
          </div>
          <div style="margin-top:6px">
            <span class="badge ${inv.status === 'Issued' ? 'bg-issued' : inv.status === 'Paid' ? 'bg-paid' : 'bg-cancelled'}">
              ${t('INVOICES.LIST.STATUSES.' + inv.status)}
            </span>
          </div>
        </div>
      </div>

      <!-- Info rows -->
      <div class="info-row">
        <span class="label">${t('INVOICES.FORM.CLIENT')}</span>
        <span class="value">${this.escapeHtml(isAr ? inv.clientNameAr : inv.clientNameEn)}</span>
      </div>
      <div class="info-row">
        <span class="label">${t('INVOICES.PRINT.CLIENT_PHONE')}</span>
        <span class="value">${this.escapeHtml(inv.clientPhone)}</span>
      </div>
      <div class="info-row">
        <span class="label">${t('INVOICES.FORM.BRANCH')}</span>
        <span class="value">${this.escapeHtml(isAr ? inv.branchNameAr : inv.branchNameEn)}</span>
      </div>
      ${inv.dueDate ? `
      <div class="info-row">
        <span class="label">${t('INVOICES.FORM.DUE_DATE')}</span>
        <span class="value">${new Date(inv.dueDate).toLocaleDateString()}</span>
      </div>` : ''}
      ${inv.notes ? `
      <div class="info-row">
        <span class="label">${t('INVOICES.FORM.NOTES')}</span>
        <span class="value">${this.escapeHtml(inv.notes)}</span>
      </div>` : ''}

      <!-- Items -->
      <div class="section-title">${t('INVOICES.ITEMS.TITLE')}</div>
      <table>
        <thead><tr>
          <th style="width:36px">#</th>
          <th>${t('INVOICES.ITEMS.DESCRIPTION')}</th>
          <th>${t('INVOICES.ITEMS.UNIT_PRICE')}</th>
          <th>${t('INVOICES.ITEMS.TOTAL')}</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <!-- Financial summary -->
      <div class="summary">
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.SUB_TOTAL')}</span><div class="val">${inv.subTotal.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.DISCOUNT')}</span><div class="val text-danger">${inv.discountAmount.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.TAX_AMOUNT')} (${(inv.taxRate * 100).toFixed(0)}%)</span><div class="val">${inv.taxAmount.toFixed(2)}</div></div>
        <div class="box" style="background:#f5f5f5"><span class="lbl">${t('INVOICES.PAYMENTS.TOTAL_WITH_TAX')}</span><div class="val">${inv.totalWithTax.toFixed(2)} ${inv.currency}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.TOTAL_PAID')}</span><div class="val text-success">${inv.totalPaid.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.BALANCE')}</span><div class="val ${inv.balance > 0 ? 'text-danger' : 'text-success'}">${inv.balance.toFixed(2)} ${inv.currency}</div></div>
      </div>

      <div class="vat-note">${t('INVOICES.PRINT.VAT_INCLUDED')}</div>

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

  printConsolidated(data: ConsolidatedInvoiceData): void {
    const lang = this.translate.currentLang || 'ar';
    const isAr = lang === 'ar';
    const dir = isAr ? 'rtl' : 'ltr';
    const t = (key: string) => this.translate.instant(key);

    const now = new Date();
    const locale = isAr ? 'ar-SA' : 'en-US';
    const dateStr = now.toLocaleDateString(locale);

    const itemsRows = data.items.map((item, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${this.escapeHtml(isAr ? (item.serviceNameAr || item.description) : (item.serviceNameEn || item.description))}</td>
        <td style="text-align:center">${item.unitPrice.toFixed(2)}</td>
        <td style="text-align:center">${item.totalPrice.toFixed(2)}</td>
      </tr>
    `).join('');

    const vehicleHtml = data.manufacturerNameAr || data.manufacturerNameEn ? `
      <div class="section-title">${t('INVOICES.CONSOLIDATION.VEHICLE_INFO')}</div>
      <div class="info-row">
        <span class="label">${t('INVOICES.CONSOLIDATION.MANUFACTURER')}</span>
        <span class="value">${this.escapeHtml(isAr ? data.manufacturerNameAr : data.manufacturerNameEn)}</span>
      </div>
      <div class="info-row">
        <span class="label">${t('INVOICES.CONSOLIDATION.MODEL')}</span>
        <span class="value">${this.escapeHtml(isAr ? data.carMarkNameAr : data.carMarkNameEn)}</span>
      </div>
      ${data.year ? `<div class="info-row"><span class="label">${t('INVOICES.CONSOLIDATION.YEAR')}</span><span class="value">${data.year}</span></div>` : ''}
      ${data.color ? `<div class="info-row"><span class="label">${t('INVOICES.CONSOLIDATION.COLOR')}</span><span class="value">${this.escapeHtml(data.color)}</span></div>` : ''}
      ${data.plateLetters || data.plateNumbers ? `<div class="info-row"><span class="label">${t('INVOICES.CONSOLIDATION.PLATE')}</span><span class="value">${this.escapeHtml(data.plateLetters)} ${this.escapeHtml(data.plateNumbers)}</span></div>` : ''}
      ${data.vin ? `<div class="info-row"><span class="label">${t('INVOICES.CONSOLIDATION.VIN')}</span><span class="value">${this.escapeHtml(data.vin)}</span></div>` : ''}
    ` : '';

    const html = `
    <!DOCTYPE html>
    <html dir="${dir}" lang="${lang}">
    <head>
      <meta charset="utf-8">
      <title>${t('INVOICES.CONSOLIDATION.TITLE')}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 13px; color: #333; padding: 24px; direction: ${dir}; max-width: 800px; margin: 0 auto; }

        .header { text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #ddd; }
        .header h1 { font-size: 22px; margin-bottom: 6px; }
        .header .meta { font-size: 12px; color: #666; line-height: 1.6; }

        .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; border-bottom: 1px solid #eee; }
        .info-row .label { color: #888; font-size: 12px; }
        .info-row .value { font-weight: 600; font-size: 13px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #ddd; padding: 7px 10px; font-size: 12px; }
        th { background: #f5f5f5; font-weight: 600; }

        .section-title { font-size: 14px; font-weight: 700; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }

        .summary { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .summary .box { border: 1px solid #ddd; border-radius: 6px; padding: 10px; text-align: center; }
        .summary .box .lbl { font-size: 11px; color: #888; display: block; }
        .summary .box .val { font-size: 15px; font-weight: 700; }

        .text-success { color: #198754; } .text-danger { color: #dc3545; }
        .vat-note { text-align: center; color: #dc3545; font-size: 12px; margin: 8px 0 16px; }

        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>

      <div class="header">
        <h1>${t('INVOICES.CONSOLIDATION.TITLE')}</h1>
        <div class="meta">
          ${t('INVOICES.CONSOLIDATION.INVOICE_COUNT')}: ${data.invoiceCount}<br>
          ${t('INVOICES.PRINT.ISSUE_DATE')}: ${dateStr}
        </div>
      </div>

      <!-- Client Info -->
      <div class="section-title">${t('INVOICES.CONSOLIDATION.CLIENT_INFO')}</div>
      <div class="info-row">
        <span class="label">${t('INVOICES.FORM.CLIENT')}</span>
        <span class="value">${this.escapeHtml(isAr ? data.clientNameAr : data.clientNameEn)}</span>
      </div>
      <div class="info-row">
        <span class="label">${t('INVOICES.PRINT.CLIENT_PHONE')}</span>
        <span class="value">${this.escapeHtml(data.clientPhone)}</span>
      </div>

      <!-- Vehicle Info -->
      ${vehicleHtml}

      <!-- Items -->
      <div class="section-title">${t('INVOICES.ITEMS.TITLE')}</div>
      <table>
        <thead><tr>
          <th style="width:36px">#</th>
          <th>${t('INVOICES.ITEMS.DESCRIPTION')}</th>
          <th>${t('INVOICES.ITEMS.UNIT_PRICE')}</th>
          <th>${t('INVOICES.ITEMS.TOTAL')}</th>
        </tr></thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <!-- Financial summary -->
      <div class="summary">
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.SUB_TOTAL')}</span><div class="val">${data.subTotal.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.DISCOUNT')}</span><div class="val text-danger">${data.discountAmount.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.TAX_AMOUNT')}</span><div class="val">${data.taxAmount.toFixed(2)}</div></div>
        <div class="box" style="background:#f5f5f5"><span class="lbl">${t('INVOICES.PAYMENTS.TOTAL_WITH_TAX')}</span><div class="val">${data.totalWithTax.toFixed(2)} ${data.currency}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.TOTAL_PAID')}</span><div class="val text-success">${data.totalPaid.toFixed(2)}</div></div>
        <div class="box"><span class="lbl">${t('INVOICES.PAYMENTS.BALANCE')}</span><div class="val ${data.balance > 0 ? 'text-danger' : 'text-success'}">${data.balance.toFixed(2)} ${data.currency}</div></div>
      </div>

      <div class="vat-note">${t('INVOICES.PRINT.VAT_INCLUDED')}</div>

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
