import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ApiResponse } from 'src/app/shared/Models/api-response';
import { ClientDto } from 'src/app/shared/Models/clients/client-dto';
import { LookupDto } from 'src/app/shared/Models/lookup-dto';

@Component({
  selector: 'app-client-individual-form',
  standalone: false,
  templateUrl: './client-individual-form.html',
})
export class ClientIndividualForm implements OnInit, OnDestroy {
  @Input() initialData?: ClientDto;

  formGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  resources: LookupDto[] = [];


  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private formService: FormService,
    private toastr: ToastrService,
    public lang: LanguageService
  ) { }

  ngOnInit(): void {
     this.loadResources();
    this.initForm();
    debugger
    if (this.initialData) {
      this.formGroup.patchValue({
        email: this.initialData.email,
        nameEn: this.initialData.nameEn,
        nameAr: this.initialData.nameAr,
        phoneNumber: this.initialData.phoneNumber,
        address: this.initialData.address,
        resourceId: this.initialData.sourceId,
      });
    }
   
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  initForm(): void {
    this.formGroup = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nameEn: ['', [Validators.required, Validators.maxLength(200)]],
      nameAr: ['', [Validators.required, Validators.maxLength(200)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      address: [''],
      resourceId: ['', Validators.required],
    });
  }
  loadResources(): void {
    this.apiService.get<ApiResponse<LookupDto[]>>('ClientResources')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.resources = res.data; },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, 'Failed to load client resources'), 'Error');
        }
      });
  }

  isInvalid(field: string): boolean {
    const c = this.formGroup.get(field);
    return !!c && c.invalid && (c.touched || c.dirty);
  }
}
