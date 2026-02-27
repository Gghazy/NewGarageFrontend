import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { ApiService } from 'src/app/core/services/custom.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { MechPartForm } from '../mech-part-form/mech-part-form';
import { ConfirmDeleteModal } from 'src/app/shared/components/confirm-delete-modal/confirm-delete-modal';
import { TranslateService } from '@ngx-translate/core';
import { MechPartDto } from 'src/app/shared/Models/mech-parts/mech-part-dto';

@Component({
  selector: 'app-mech-part-list',
  standalone: false,
  templateUrl: './mech-part-list.html',
  styleUrl: './mech-part-list.css',
})
export class MechPartList implements OnInit, OnDestroy {
  mechParts: MechPartDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameAr',
    desc: false,
    totalItems: 0
  };

  constructor(
    public apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    private translate: TranslateService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.loadMechParts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMechParts() {
    this.loading = true;
    this.apiService.post<any>('MechParts/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.mechParts = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading mech parts', err);
          this.toastr.error('Failed to load mech parts', 'Error');
          this.loading = false;
        }
      });
  }

  openAddMechPart() {
    const ref = this.modal.open(MechPartForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('MECH_PARTS.ADD');
    ref.result.then(() => this.loadMechParts()).catch(() => { });
  }

  openEditMechPart(mechPart: MechPartDto) {
    const ref = this.modal.open(MechPartForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('COMMON.EDIT');
    ref.componentInstance.initial = {
      id: mechPart.id,
      nameAr: mechPart.nameAr,
      nameEn: mechPart.nameEn,
      mechPartTypeId: mechPart.mechPartTypeId
    };
    ref.result.then(() => this.loadMechParts()).catch(() => { });
  }

  deleteMechPart(mechPart: MechPartDto) {
    const ref = this.modal.open(ConfirmDeleteModal, { centered: true, backdrop: 'static' });
    ref.result.then(() => {
      this.apiService.delete(`MechParts/${mechPart.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success(this.translate.instant('COMMON.DELETED_SUCCESSFULLY'), 'Success');
            this.loadMechParts();
          },
          error: (err) => {
            this.toastr.error(err?.error?.message ?? this.translate.instant('COMMON.DELETE_FAILED'), 'Error');
          }
        });
    }).catch(() => {});
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.loadMechParts();
  }
}
