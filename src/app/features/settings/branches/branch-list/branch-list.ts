import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { BranchForm, BranchFormValue } from '../branch-form/branch-form';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { TranslateService } from '@ngx-translate/core';

export interface Branch {
  id: number;
  nameAr: string;
  nameEn: string;
  isActive?: boolean;
}

@Component({
  selector: 'app-branch-list',
  standalone: false,
  templateUrl: './branch-list.html',
  styleUrl: './branch-list.css',
})
export class BranchList implements OnInit {

  branches: Branch[] = [];
  loading = false;

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
    this.loadBranches();
  }

  loadBranches() {
    this.loading = true;

    this.apiService.post<any>('branches/pagination', this.pagingConfig).subscribe({
      next: (res) => {
        debugger
        this.branches = res.data.items;
        this.pagingConfig.totalItems = res.data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading branches', err);
        this.loading = false;
      }
    });
  }
  openAddBranch() {
    const ref = this.modal.open(BranchForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('BRANCH.ADD');

    ref.result.then((value: BranchFormValue) => {
      this.loadBranches();
    }).catch(() => { });

  }
  openEditBranch(branch: any) {
    const ref = this.modal.open(BranchForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.title = this.translate.instant('BRANCH.EDIT');
    ref.componentInstance.initial = {
      id: branch.id,
      nameAr: branch.nameAr,
      nameEn: branch.nameEn,
    };

    ref.result.then(() => {
      this.loadBranches();
    }).catch(() => { });
  }
  search() {
    this.pagingConfig.currentPage = 1;
    this.loadBranches();
  }

}
