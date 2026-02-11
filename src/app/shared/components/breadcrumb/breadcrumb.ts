import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

type Crumb = { label: string; url: string };

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
  standalone: false
})

export class Breadcrumb {
  crumbs: Crumb[] = [];
  

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.crumbs = this.buildCrumbs(this.route.root);
    });
  }

  private buildCrumbs(route: ActivatedRoute, url = '', crumbs: Crumb[] = []): Crumb[] {
    const children = route.children;
    if (!children || children.length === 0) return crumbs;

    for (const child of children) {
      const routeURL = child.snapshot.url.map(s => s.path).join('/');
      if (routeURL) url += `/${routeURL}`;

      const label = child.snapshot.data?.['breadcrumb'];
      if (label) crumbs.push({ label, url });

      return this.buildCrumbs(child, url, crumbs);
    }
    return crumbs;
  }
}
