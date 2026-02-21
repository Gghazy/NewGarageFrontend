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
  selector: 'app-client-company-form',
  standalone: false,
  templateUrl: './client-company-form.html',
})
export class ClientCompanyForm implements OnInit, OnDestroy {
  @Input() initialData?: ClientDto;

  formGroup!: FormGroup;
  private destroy$ = new Subject<void>();
  resources: LookupDto[] = [];



  constructor(
    private fb: FormBuilder,
    public lang: LanguageService,
    private formService: FormService,
    public apiService: ApiService,
    private toastr: ToastrService  
  
  ) { }

  ngOnInit(): void {
    this.loadResources();
    this.initForm();
    if (this.initialData) {
      this.formGroup.patchValue({
        email: this.initialData.email,
        nameEn: this.initialData.nameEn,
        nameAr: this.initialData.nameAr,
        phoneNumber: this.initialData.phoneNumber,
        commercialRegister: this.initialData.commercialRegister,
        taxNumber: this.initialData.taxNumber,
        resourceId: this.initialData.sourceId,
        streetName: this.initialData.streetName,
        additionalStreetName: this.initialData.additionalStreetName,
        cityName: this.initialData.cityName,
        postalZone: this.initialData.postalZone,
        countrySubentity: this.initialData.countrySubentity,
        countryCode: this.initialData.countryCode,
        buildingNumber: this.initialData.buildingNumber,
        citySubdivisionName: this.initialData.citySubdivisionName,
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
      commercialRegister: ['', [Validators.required, Validators.maxLength(50)]],
      taxNumber: ['', [Validators.required, Validators.maxLength(50)]],
      streetName: ['', [Validators.required, Validators.maxLength(200)]],
      additionalStreetName: ['', [Validators.maxLength(200)]],
      cityName: ['', [Validators.required, Validators.maxLength(100)]],
      postalZone: ['', [Validators.required, Validators.maxLength(20)]],
      countrySubentity: [''],
      countryCode: ['', [Validators.required, Validators.maxLength(5)]],
      buildingNumber: ['', [Validators.required, Validators.maxLength(20)]],
      resourceId: [null, [Validators.required]],
      citySubdivisionName: [''],
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
