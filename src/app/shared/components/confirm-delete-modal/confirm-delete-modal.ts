import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-delete-modal',
  standalone: false,
  template: `
    <div class="modal-header border-0 pb-0">
      <h5 class="modal-title text-danger">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ titleKey | translate }}
      </h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body pt-2">
      <p class="mb-0">{{ messageKey | translate }}</p>
    </div>

    <div class="modal-footer border-0">
      <button type="button" class="btn btn-light" (click)="activeModal.dismiss()">
        {{ 'COMMON.CANCEL' | translate }}
      </button>
      <button type="button" class="btn btn-danger" (click)="activeModal.close(true)">
        <i class="bi bi-trash me-1"></i>
        {{ 'COMMON.DELETE' | translate }}
      </button>
    </div>
  `,
})
export class ConfirmDeleteModal {
  @Input() titleKey = 'COMMON.CONFIRM_DELETE.TITLE';
  @Input() messageKey = 'COMMON.CONFIRM_DELETE.MESSAGE';

  constructor(public activeModal: NgbActiveModal) {}
}
