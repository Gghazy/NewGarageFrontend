import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLang = 'ar' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = 'lang';
  private readonly supported: AppLang[] = ['ar', 'en'];
  readonly defaultLang: AppLang = 'ar';

  readonly lang = signal<AppLang>('ar');

  constructor(private translate: TranslateService) {}

  init() {
    this.translate.addLangs(this.supported);
    this.translate.setDefaultLang(this.defaultLang);

    const saved = (localStorage.getItem(this.storageKey) as AppLang) || this.defaultLang;
    const lang: AppLang = this.supported.includes(saved) ? saved : this.defaultLang;

    this.setLang(lang);

    // ⭐ أهم سطر: اسمع تغيير اللغة من ngx-translate
    this.translate.onLangChange.subscribe(e => {
      this.lang.set(e.lang as AppLang);
    });
  }

  get current(): AppLang {
    return this.lang(); // بدل translate.currentLang
  }

  setLang(lang: AppLang) {
    this.translate.use(lang);
    localStorage.setItem(this.storageKey, lang);

    this.lang.set(lang);

    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    document.body.classList.toggle('rtl', dir === 'rtl');
    document.body.classList.toggle('ltr', dir === 'ltr');
  }

  toggle() {
    this.setLang(this.current === 'ar' ? 'en' : 'ar');
  }
}
