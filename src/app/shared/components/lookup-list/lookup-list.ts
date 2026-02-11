import { Component, Input } from '@angular/core';
import { LookupDto } from '../../Models/lookup-dto';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from '../../Models/search-criteria';
import { LookupConfig } from '../../Models/lookup-config';
import { LookupForm } from '../lookup-form/lookup-form';

@Component({
  selector: 'app-lookup-list',
  standalone: false,
  templateUrl: './lookup-list.html',
  styleUrl: './lookup-list.css',
})
export class LookupList {
  @Input({ required: true }) config!: LookupConfig;

  items: LookupDto[] = [];
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
    private translate: TranslateService,
    public authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;

    this.apiService.post<any>(`${this.config.apiBase}/pagination`, this.pagingConfig).subscribe({
      next: (data) => {
        this.items = data.items;
        this.pagingConfig.totalItems = data.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lookups', err);
        this.loading = false;
      }
    });
  }

  openAdd() {
    const ref = this.modal.open(LookupForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.config = this.config;
    ref.componentInstance.title = this.translate.instant(this.config.addTitleKey);

    ref.result.then(() => this.load()).catch(() => { });
  }

  openEdit(row: LookupDto) {
    const ref = this.modal.open(LookupForm, { centered: true, backdrop: 'static' });
    ref.componentInstance.config = this.config;
    ref.componentInstance.title = this.translate.instant(this.config.editTitleKey);
    ref.componentInstance.initial = { id: row.id, nameAr: row.nameAr, nameEn: row.nameEn };

    ref.result.then(() => this.load()).catch(() => { });
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.load();
  }
}
