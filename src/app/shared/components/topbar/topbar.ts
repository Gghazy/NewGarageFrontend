import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LanguageService } from 'src/app/core/services/language.service';

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
  public langService: LanguageService
  ) {}

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
}
