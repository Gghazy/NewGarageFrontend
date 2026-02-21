import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { STORAGE_KEYS, SUPPORTED_LANGS, SupportedLang } from '../constants/app.constants';

export type AppLang = SupportedLang;

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly storageKey = STORAGE_KEYS.LANG;
  private readonly supported: AppLang[] = [SUPPORTED_LANGS.AR, SUPPORTED_LANGS.EN];
  readonly defaultLang: AppLang = SUPPORTED_LANGS.AR;

  readonly lang = signal<AppLang>(SUPPORTED_LANGS.AR);

  constructor(private translate: TranslateService) {}

  init() {
    this.translate.addLangs(this.supported);
    this.translate.setDefaultLang(this.defaultLang);

    const saved = (localStorage.getItem(this.storageKey) as AppLang) || this.defaultLang;
    const lang: AppLang = this.supported.includes(saved) ? saved : this.defaultLang;

    this.setLang(lang);

    this.translate.onLangChange.subscribe(e => {
      this.lang.set(e.lang as AppLang);
    });
  }

  get current(): AppLang {
    return this.lang();
  }

  setLang(lang: AppLang) {
    this.translate.use(lang);
    localStorage.setItem(this.storageKey, lang);

    this.lang.set(lang);

    const dir = lang === SUPPORTED_LANGS.AR ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;

    document.body.classList.toggle('rtl', dir === 'rtl');
    document.body.classList.toggle('ltr', dir === 'ltr');
  }

  toggle() {
    this.setLang(this.current === SUPPORTED_LANGS.AR ? SUPPORTED_LANGS.EN : SUPPORTED_LANGS.AR);
  }
}
