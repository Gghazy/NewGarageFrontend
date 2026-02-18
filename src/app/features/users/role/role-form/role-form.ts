import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/core/services/custom.service';

export type PermissionMap = Record<string, string[]>;

export type PermissionSelection = Record<string, Set<string>>
type ViewModule = {
  name: string;
  key: string;
  actions: string[];
};
@Component({
  selector: 'app-role-form',
  standalone: false,
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
})


export class RoleForm {
  loading = true;
  saving = false;
  isEdit = false;
  // edit mode
  roleId?: string;
  roleName = '';

  modules: ViewModule[] = [];
  selected = new Map<string, Set<string>>();

  private readonly actionOrder = ['Read', 'Create', 'Update', 'Delete'];

  constructor(
    private api: ApiService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(p => {

      this.roleId = p.get('id') ?? undefined;
      this.isEdit = !!this.roleId;

      if (this.isEdit)
        this.loadRole(this.roleId!);
    });

    this.api.get<PermissionMap>('Permissions/grouped').subscribe({
      next: (map) => {
        this.modules = this.toView(map);
        this.modules.forEach(m => this.selected.set(m.name, new Set<string>()));
        if (this.roleId) {
          this.loadRole(this.roleId);
        } else {
          this.loading = false;
        }
      },
      error: () => (this.loading = false)
    });
  }

  private loadRole(id: string) {
    this.apiService.get<any>(`Roles/${id}`).subscribe({
      next: (role) => {
        this.roleName = role.name ?? '';
        this.applyFlatPermissions(role.permissions ?? []);
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }


  toggle(moduleName: string, action: string, checked: boolean): void {
    const set = this.selected.get(moduleName) ?? new Set<string>();

    if (checked) {
      set.add(action);
      if (action !== 'Read') set.add('Read');
    } else {
      set.delete(action);
      if (action === 'Read') ['Create', 'Update', 'Delete'].forEach(a => set.delete(a));
    }

    this.selected.set(moduleName, set);
  }

  toggleAllInModule(moduleName: string, actions: string[], checked: boolean): void {
    const set = new Set<string>();
    if (checked) {
      actions.forEach(a => set.add(a));
      if (actions.some(a => a !== 'Read')) set.add('Read');
    }
    this.selected.set(moduleName, set);
  }

  isAllSelected(moduleName: string, actions: string[]): boolean {
    const set = this.selected.get(moduleName);
    return !!set && actions.length > 0 && actions.every(a => set.has(a));
  }

  isSelected(moduleName: string, action: string): boolean {
    return this.selected.get(moduleName)?.has(action) ?? false;
  }


  save(): void {
    
    const roleName = (this.roleName || '').trim();
    if (!roleName) return;

    const permissions = this.buildFlatPermissions();

    this.saving = true;

    const body = { roleName, permissions };


      

    this.apiService.post('Roles', body).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/features/users/roles']); 
      },
      error: () => (this.saving = false)
    });
  }

  buildFlatPermissions(): string[] {
    const flat: string[] = [];

    for (const m of this.modules) {
      const set = this.selected.get(m.name);
      if (!set || set.size === 0) continue;

      for (const action of set.values()) {
        flat.push(`${m.key}.${action.toLowerCase()}`);
      }
    }

    return Array.from(new Set(flat)).sort((a, b) => a.localeCompare(b));
  }

  private applyFlatPermissions(flat: string[]): void {
    for (const p of flat) {
      const [modKey, act] = p.split('.');
      if (!modKey || !act) continue;

      const module = this.modules.find(m => m.key === modKey);
      if (!module) continue;

      const action = this.toActionLabel(act);
      const set = this.selected.get(module.name) ?? new Set<string>();
      set.add(action);
      this.selected.set(module.name, set);
    }
  }

  private toActionLabel(a: string): string {
    const x = (a || '').toLowerCase();
    if (x === 'read') return 'Read';
    if (x === 'create') return 'Create';
    if (x === 'update') return 'Update';
    if (x === 'delete') return 'Delete';
    return x ? x[0].toUpperCase() + x.slice(1) : a;
  }


  private toView(map: PermissionMap): ViewModule[] {
    return Object.entries(map)
      .map(([moduleName, actions]) => ({
        name: moduleName,
        key: this.toCamel(moduleName),
        actions: this.sortActions(actions)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private sortActions(actions: string[]): string[] {
    return [...actions].sort((a, b) => {
      const ia = this.actionOrder.indexOf(a);
      const ib = this.actionOrder.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }

  private toCamel(value: string): string {
    if (!value) return value;
    return value[0].toLowerCase() + value.slice(1);
  }
}
