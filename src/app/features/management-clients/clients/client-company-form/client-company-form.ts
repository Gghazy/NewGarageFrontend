import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-client-company-form',
  standalone: false,
  templateUrl: './client-company-form.html',
})
export class ClientCompanyForm implements OnInit, OnDestroy {
  formGroup!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.formGroup = this.formBuilder.group({
      companyNameEn: ['', [Validators.minLength(3)]],
      companyNameAr: ['', [Validators.minLength(3)]],
      mobileNumber: ['', [Validators.required]],
      commercialRegistrationNumber: ['', [Validators.required]],
      taxNumber: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      source: ['', [Validators.required]],
      address: ['', [Validators.required]],
      street: ['', [Validators.required]],
      buildingNo: ['', [Validators.required]],
      floorNo: ['', [Validators.required]],
      district: ['', [Validators.required]],
      city: ['', [Validators.required]],
      countryCode: ['', [Validators.required]],
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.formGroup.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.formGroup.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.hasError('required')) {
      return `${fieldName} is required`;
    }
    if (field.hasError('minlength')) {
      const minLength = field.getError('minlength');
      return `${fieldName} must be at least ${minLength.requiredLength} characters`;
    }
    if (field.hasError('email')) {
      return 'Invalid email format';
    }

    return '';
  }
}
