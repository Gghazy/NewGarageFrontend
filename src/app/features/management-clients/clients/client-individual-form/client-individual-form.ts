import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-client-individual-form',
  standalone: false,
  templateUrl: './client-individual-form.html',
})
export class ClientIndividualForm implements OnInit, OnDestroy {
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
      nameEn: ['', [Validators.minLength(3)]],
      nameAr: ['', [Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      mobileNumber: ['', [Validators.required]],
      phone: ['', []],
      source: ['', [Validators.required]],
      address: ['', []],
      street: ['', []],
      buildingNo: ['', []],
      floorNo: ['', []],
      district: ['', []],
      city: ['', []],
      countryCode: ['', [Validators.required]],
      isActive: [true, []]
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
