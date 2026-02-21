import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { ClientIndividualForm } from '../client-individual-form/client-individual-form';
import { ClientCompanyForm } from '../client-company-form/client-company-form';

@Component({
  selector: 'app-client-form',
  standalone: false,
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.css']
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

  constructor(
    private formBuilder: FormBuilder,
    public activeModal: NgbActiveModal,
    private toastr: ToastrService,
    private apiService: ApiService,
    private formService: FormService
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
    this.apiService.get<ApiResponse<ClientDto>>(`Clients/${this.clientId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const client = res.data;
          this.clientType = client.type || 'individual';
          this.form.patchValue({ type: client.type });
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, 'Failed to load client'), 'Error');
          this.loading = false;
        }
      });
  }

  submit() {
    const childForm = this.clientType === 'individual'
      ? this.individualForm?.formGroup
      : this.companyForm?.formGroup;

    if (!childForm || childForm.invalid) {
      childForm?.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    const formData = { type: this.clientType, ...childForm.value };
    const isEdit = !!this.clientId;
    const apiCall: Observable<unknown> = isEdit
      ? this.apiService.put(`Clients/${this.clientId}`, formData)
      : this.apiService.post('Clients', formData);

    this.formService.handleSubmit(apiCall.pipe(takeUntil(this.destroy$)), {
      activeModal: this.activeModal,
      toastr: this.toastr,
      successMsg: isEdit ? 'Client updated successfully' : 'Client added successfully',
      errorFallback: isEdit ? 'Failed to update client' : 'Failed to add client',
      setLoading: (v) => (this.loading = v),
    });
  }
}
