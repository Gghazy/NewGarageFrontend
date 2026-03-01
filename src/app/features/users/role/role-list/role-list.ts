import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/core/services/custom.service';
import { RoleDto } from 'src/app/shared/Models/roles/role-dto';

@Component({
  selector: 'app-role-list',
  standalone: false,
  templateUrl: './role-list.html',
  styleUrl: './role-list.css',
})
export class RoleList implements OnInit, OnDestroy {
  loading = true;
  roles: RoleDto[] = [];
  allRoles: RoleDto[] = [];
  searchTerm = '';
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load() {
    this.loading = true;
    // RolesController returns raw List<RoleDto> (no ApiResponse wrapper)
    this.apiService.get<any>('Roles')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allRoles = res.data;
          this.roles = this.allRoles;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading roles', err);
          this.toastr.error('Failed to load roles', 'Error');
          this.loading = false;
        }
      });
  }

  search() {
    const term = this.searchTerm.trim().toLowerCase();
    this.roles = term
      ? this.allRoles.filter(r => r.name.toLowerCase().includes(term))
      : this.allRoles;
  }

  create() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  edit(id: string) {
    this.router.navigate(['form', id], { relativeTo: this.route });
  }
}
