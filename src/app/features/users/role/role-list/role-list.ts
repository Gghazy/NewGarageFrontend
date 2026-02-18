import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/custom.service';
import { RoleDto } from 'src/app/shared/Models/roles/role-dto';

@Component({
  selector: 'app-role-list',
  standalone: false,
  templateUrl: './role-list.html',
  styleUrl: './role-list.css',
})
export class RoleList {
  loading = true;
  roles: RoleDto[] = [];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.apiService.get<RoleDto[]>('Roles').subscribe({
      next: res => {
        this.roles = res;
        this.loading = false;
      },
      error: _ => this.loading = false
    });
  }

  create() {
    this.router.navigate(['form'], { relativeTo: this.route });
  }

  edit(id: string) {
    this.router.navigate(['form', id], { relativeTo: this.route });
  }
}
