import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/core/services/custom.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { SearchCriteria } from 'src/app/shared/Models/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClientForm } from '../client-form/client-form';

@Component({
  selector: 'app-client-list',
  standalone: false,
  templateUrl: './client-list.html',
  styleUrl: './client-list.css',
})
export class ClientList implements OnInit, OnDestroy {
  clients: any[] = [];
  private destroy$ = new Subject<void>();

  pagingConfig: SearchCriteria = {
    itemsPerPage: 10,
    currentPage: 1,
    textSearch: '',
    sort: 'nameEn',
    desc: false,
    totalItems: 0
  };

  constructor(
    public apiService: ApiService,
    private modal: NgbModal,
    private toastr: ToastrService,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients() {
    this.apiService.post<any>('Clients/pagination', this.pagingConfig)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.clients = res.data.items;
          this.pagingConfig.totalItems = res.data.totalCount;
        },
        error: (err) => {
          console.error('[ClientList] Failed to load clients:', err);
          this.toastr.error('Failed to load clients', 'Error');
        }
      });
  }

  openAddClient() {
    const ref = this.modal.open(ClientForm, { centered: true, backdrop: 'static', size: 'lg' });
    ref.componentInstance.title = 'Add Client';

    ref.result.then(() => this.loadClients()).catch(() => {});
  }

  openEditClient(client: any) {
    const ref = this.modal.open(ClientForm, { centered: true, backdrop: 'static', size: 'lg' });
    ref.componentInstance.title = 'Edit Client';
    ref.componentInstance.clientId = client.id;

    ref.result.then(() => this.loadClients()).catch(() => {});
  }

  deleteClient(client: any) {
    if (confirm('Are you sure you want to delete this client?')) {
      this.apiService.delete(`Clients/${client.id}`)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastr.success('Client deleted successfully', 'Success');
            this.loadClients();
          },
          error: (err) => {
            console.error('[ClientList] Failed to delete client:', err);
            this.toastr.error(err?.error?.message ?? 'Failed to delete client', 'Error');
          }
        });
    }
  }

  search() {
    this.pagingConfig.currentPage = 1;
    this.loadClients();
  }
}
