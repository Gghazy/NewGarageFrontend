import { Injectable } from '@angular/core';
import { CONFIG_KEYS } from '../constants/app.constants';

// local
export const baseUrl = `https://localhost:44375/`;

@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  private _config: Record<string, string>;

  constructor() {
    this._config = {
      [CONFIG_KEYS.PATH_API]: baseUrl
    };
  }

  get setting(): Record<string, string> {
    return this._config;
  }

  get(key: string): string {
    return this._config[key];
  }
}
