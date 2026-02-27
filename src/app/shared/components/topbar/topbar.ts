import { Component, computed } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ThemeService } from 'src/app/core/services/theme.service';
import { APP_MENU, AppMenuItem } from './APP_MENU';

@Component({
  selector: 'app-topbar',
  standalone: false,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  constructor(
    private auth: AuthService,
    private router: Router,
    public langService: LanguageService,
    public themeService: ThemeService,
  ) { }

  readonly menu = computed(() => this.filterMenu(APP_MENU));
  employeeName = computed(() =>
    this.auth.employeeName() || this.auth.userName() || this.auth.email() || 'User'
  );

  private filterMenu(items: AppMenuItem[]): AppMenuItem[] {
    return items
      .map(item => {
        const children = item.children ? this.filterMenu(item.children) : undefined;

        const canSeeSelf = this.canSee(item.permissions);
        const hasVisibleChildren = !!children?.length;

        const visible =
          item.route ? (canSeeSelf || hasVisibleChildren) : hasVisibleChildren;

        if (!visible) return null;

        return {
          ...item,
          children,
        } as AppMenuItem;
      })
      .filter((x): x is AppMenuItem => x !== null);
  }

  private canSee(perms?: string[]): boolean {
    if (!perms || perms.length === 0) return true;
    return this.auth.hasAnyPermission(perms); // هنضيفها تحت
  }

  isParentActive(parent: AppMenuItem): boolean {
    const url = this.router.url;
    return !!parent.children?.some(child => child.route && url.startsWith(child.route));
  }

  logout(): void {
    this.auth.clear();
    this.router.navigate(['/login']);
  }

  get lang() {
    return this.langService.current;
  }

  toggleLang() {
    this.langService.toggle();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
