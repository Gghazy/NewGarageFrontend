import { Component } from '@angular/core';
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
  roleName = '';
  modules: ViewModule[] = [];
  selected = new Map<string, Set<string>>();
  private readonly actionOrder = ['Read', 'Create', 'Update', 'Delete'];

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.apiService.get<PermissionMap>('Permissions/grouped').subscribe({
      next: (map) => {
        this.modules = this.toView(map);
        // init empty selections
        this.modules.forEach(m => this.selected.set(m.name, new Set<string>()));
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

      if (action === 'Read') {
        ['Create', 'Update', 'Delete'].forEach(a => set.delete(a));
      }
    }

    this.selected.set(moduleName, set);
  }

  toggleAllInModule(moduleName: string, actions: string[], checked: boolean): void {
    const set = new Set<string>();

    if (checked) {
      actions.forEach(a => set.add(a));
      if (actions.some(a => a !== 'Read')) set.add('Read');
    } else {
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

  save(): void {
    const permissions = this.buildFlatPermissions();
    this.apiService.post('Roles', {
      roleName: this.roleName,
      permissions
    }).subscribe({
      next: () => alert('Role saved successfully!'),
      error: () => alert('Failed to save role. Please try again.')
    });
  }
}
