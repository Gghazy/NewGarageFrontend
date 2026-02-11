import { Injectable } from '@angular/core';

//local
 export const baseUrl = `https://localhost:44375/`;
//  export const baseFrontUrl = `http://localhost:4200/`;

//test
// export const baseUrl = `http://bsnspace-001-site5.mtempurl.com/`;
// export const baseFrontUrl = `http://bsnspace-001-site6.mtempurl.com/`;

//live
  // export const baseUrl = `https://cashif-001-site1.dtempurl.com/`;
  // export const baseFrontUrl = `https://cashiftest.com/`;



@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  private _config: { [key: string]: string };
  constructor() {
    this._config = {
      PathAPI: baseUrl
    };
  }
  get setting(): { [key: string]: string } {
    return this._config;
  }
  get(key: any): string {
    return this._config[key];
  }
}
