import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientIndividualForm } from '../client-individual-form/client-individual-form';
import { ClientCompanyForm } from '../client-company-form/client-company-form';

@Component({
  selector: 'app-client-form',
  standalone: false,
  templateUrl: './client-form.html',
})
export class ClientForm implements OnInit, OnDestroy {
  @ViewChild(ClientIndividualForm) individualForm?: ClientIndividualForm;
  @ViewChild(ClientCompanyForm) companyForm?: ClientCompanyForm;

  form!: FormGroup;
  title = 'Add Client';
  clientId?: number;
  clientType: 'individual' | 'company' = 'individual';
  loading = false;
  private destroy$ = new Subject<void>();

  sources: any[] = [
    { id: 1, name: 'Direct' },
    { id: 2, name: 'Referral' },
    { id: 3, name: 'Online' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.initForm();
    if (this.clientId) {
      this.loadClient();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm() {
    this.form = this.formBuilder.group({
      type: ['individual', [Validators.required]]
    });
  }

  onTypeChange(type: string) {
    this.clientType = type as 'individual' | 'company';
    this.form.patchValue({ type });
  }

  loadClient() {
    this.loading = true;
    this.apiService.get<any>(`Clients/${this.clientId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (client) => {
          this.clientType = client.type || 'individual';
          this.form.patchValue({ type: client.type });
          this.loading = false;
        },
        error: (err) => {
          console.error('[ClientForm] Failed to load client:', err);
          this.toastr.error('Failed to load client', 'Error');
          this.loading = false;
        }
      });
  }

  submit() {
    // Get full form data from child component
    const childForm = this.clientType === 'individual' ? this.individualForm?.formGroup : this.companyForm?.formGroup;
    
    if (!childForm || childForm.invalid) {
      this.toastr.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    const formData = {
      type: this.clientType,
      ...childForm.value
    };

    const apiCall = this.clientId
      ? this.apiService.put(`Clients/${this.clientId}`, formData)
      : this.apiService.post('Clients', formData);

    apiCall
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const message = this.clientId ? 'Client updated successfully' : 'Client added successfully';
          this.toastr.success(message, 'Success');
          this.activeModal.close();
        },
        error: (err) => {
          console.error('[ClientForm] Failed to save client:', err);
          const errorMsg = err?.error?.message ?? (this.clientId ? 'Failed to update client' : 'Failed to add client');
          this.toastr.error(errorMsg, 'Error');
        }
      });
  }
}
