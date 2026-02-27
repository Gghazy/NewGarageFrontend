import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from 'src/app/core/services/custom.service';
import { FormService } from 'src/app/core/services/form.service';

export type PermissionMap = Record<string, string[]>;
export type PermissionSelection = Record<string, Set<string>>;

type ViewModule = {
  name: string;
  key: string;
  actions: string[];
};

type ViewSection = {
  labelKey: string;
  icon: string;
  modules: ViewModule[];
  collapsed: boolean;
};

const SECTION_DEFS: { labelKey: string; icon: string; moduleNames: string[] }[] = [
  {
    labelKey: 'MENU.SETTINGS',
    icon: 'bi bi-gear',
    moduleNames: ['CarMark', 'Manufacturer', 'ServiceType', 'Service', 'ServicePrice', 'Crane', 'Term', 'Branches', 'PaymentMethod'],
  },
  {
    labelKey: 'MENU.EXAMINATION_MANAGEMENT',
    icon: 'bi bi-clipboard-check',
    moduleNames: ['SensorIssue', 'MechPart', 'MechPartType', 'MechIssue', 'InteriorIssue', 'InteriorBodyIssue', 'ExteriorBodyIssue', 'AccessoryIssue', 'RoadTestIssue', 'RoadTestIssueType', 'InsideAndDecorPart', 'InsideAndDecorPartIssue', 'InteriorBodyPart', 'ExteriorBodyPart'],
  },
  {
    labelKey: 'MENU.USERS',
    icon: 'bi bi-people',
    moduleNames: ['Users', 'Roles', 'Permissions', 'Employees'],
  },
  {
    labelKey: 'MENU.CLIENTS',
    icon: 'bi bi-person',
    moduleNames: ['Clients', 'ClientResource'],
  },
  {
    labelKey: 'MENU.VEHICLE_ORDERS',
    icon: 'bi bi-clipboard2-check',
    moduleNames: ['Examination'],
  },
  {
    labelKey: 'MENU.INVOICES',
    icon: 'bi bi-receipt',
    moduleNames: ['Invoice'],
  },
  {
    labelKey: 'PERMISSIONS.SECTIONS.DASHBOARD',
    icon: 'bi bi-speedometer2',
    moduleNames: ['Dashboard'],
  },
];

@Component({
  selector: 'app-role-form',
  standalone: false,
  templateUrl: './role-form.html',
  styleUrl: './role-form.css',
})
export class RoleForm implements OnInit, OnDestroy {
  loading = true;
  saving = false;
  isEdit = false;
  roleId?: string;
  roleName = '';

  modules: ViewModule[] = [];
  sections: ViewSection[] = [];
  selected = new Map<string, Set<string>>();

  private readonly actionOrder = ['Read', 'Create', 'Update', 'Delete'];
  private destroy$ = new Subject<void>();

  constructor(
    private apiService: ApiService,
    private formService: FormService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => {
        this.roleId = p.get('id') ?? undefined;
        this.isEdit = !!this.roleId;
      });

    this.apiService.get<PermissionMap>('Permissions/grouped')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (map) => {
          this.modules = this.toView(map);
          this.sections = this.buildSections(this.modules);
          this.modules.forEach(m => this.selected.set(m.name, new Set<string>()));
          if (this.roleId) {
            this.loadRole(this.roleId);
          } else {
            this.loading = false;
          }
        },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, 'Failed to load permissions'), 'Error');
          this.loading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadRole(id: string) {
    this.apiService.get<any>(`Roles/${id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.roleName = res.data.name ?? '';
          this.applyFlatPermissions(res.data.permissions ?? []);
          this.loading = false;
        },
        error: (err) => {
          this.toastr.error(this.formService.extractError(err, 'Failed to load role'), 'Error');
          this.loading = false;
        }
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

  toggleAllInSection(section: ViewSection, checked: boolean): void {
    for (const m of section.modules) {
      this.toggleAllInModule(m.name, m.actions, checked);
    }
  }

  isAllSelected(moduleName: string, actions: string[]): boolean {
    const set = this.selected.get(moduleName);
    return !!set && actions.length > 0 && actions.every(a => set.has(a));
  }

  isAllSectionSelected(section: ViewSection): boolean {
    return section.modules.length > 0 && section.modules.every(m => this.isAllSelected(m.name, m.actions));
  }

  isSomeSectionSelected(section: ViewSection): boolean {
    return section.modules.some(m => {
      const set = this.selected.get(m.name);
      return !!set && set.size > 0;
    });
  }

  isSelected(moduleName: string, action: string): boolean {
    return this.selected.get(moduleName)?.has(action) ?? false;
  }

  save(): void {
    const roleName = (this.roleName || '').trim();
    if (!roleName) {
      this.toastr.warning('Role name is required', 'Validation');
      return;
    }

    const permissions = this.buildFlatPermissions();
    this.saving = true;

    const body = { roleName, permissions };
    const apiCall = this.apiService.post('Roles', body);

    apiCall.pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.toastr.success(res?.message ?? (this.isEdit ? 'Role updated successfully' : 'Role created successfully'), 'Success');
        this.saving = false;
        this.router.navigate(['/features/users/roles']);
      },
      error: (err) => {
        this.toastr.error(this.formService.extractError(err, 'Failed to save role'), 'Error');
        this.saving = false;
      }
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

  private buildSections(modules: ViewModule[]): ViewSection[] {
    const moduleMap = new Map(modules.map(m => [m.name, m]));
    const assigned = new Set<string>();
    const sections: ViewSection[] = [];

    for (const def of SECTION_DEFS) {
      const sectionModules: ViewModule[] = [];
      for (const name of def.moduleNames) {
        const mod = moduleMap.get(name);
        if (mod) {
          sectionModules.push(mod);
          assigned.add(name);
        }
      }
      if (sectionModules.length > 0) {
        sections.push({
          labelKey: def.labelKey,
          icon: def.icon,
          modules: sectionModules,
          collapsed: true,
        });
      }
    }

    // Any modules not assigned to a section go into "Other"
    const remaining = modules.filter(m => !assigned.has(m.name));
    if (remaining.length > 0) {
      sections.push({
        labelKey: 'PERMISSIONS.SECTIONS.OTHER',
        icon: 'bi bi-three-dots',
        modules: remaining,
        collapsed: false,
      });
    }

    return sections;
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
