import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { ClientIndividualForm } from '../client-individual-form/client-individual-form';
import { ClientCompanyForm } from '../client-company-form/client-company-form';

// ClientType values from backend SmartEnum

@Component({
  selector: 'app-client-form',
  standalone: false,
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.css']
})
export class ClientForm implements OnInit, OnDestroy {
  @ViewChild(ClientIndividualForm) individualForm?: ClientIndividualForm;
  @ViewChild(ClientCompanyForm) companyForm?: ClientCompanyForm;

  @Input() title = 'Add Client';
  @Input() clientId?: string;   // Guid – for edit endpoint
  @Input() client?: ClientDto;  // Pre-populate fields in edit mode

  clientType: 'individual' | 'company' = 'individual';
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private apiService: ApiService,
    private formService: FormService,
  ) {}

  ngOnInit(): void {
    if (this.client) {
      this.clientType = this.client.typeEn?.toLowerCase() === 'company' ? 'company' : 'individual';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTypeChange(type: 'individual' | 'company'): void {
    this.clientType = type;
  }

  submit(): void {
    debugger
    const childForm = this.clientType === 'individual'
      ? this.individualForm?.formGroup
      : this.companyForm?.formGroup;

    childForm?.markAllAsTouched();
    debugger
    if (!childForm || childForm.invalid) {
      this.toastr.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    const typeValue = this.clientType === 'individual' ? 'Individual' : 'Company';
    const payload = { type: typeValue, ...childForm.value };

    const isEdit = !!this.clientId;
    const apiCall = isEdit
      ? this.apiService.put(`Clients/${this.clientId}`, payload)
      : this.apiService.post('Clients', payload);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)), {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Client updated successfully' : 'Client added successfully',
      errorFallback: isEdit ? 'Failed to update client' : 'Failed to add client',
      setLoading: (v) => (this.loading = v),
    });
  }
}
