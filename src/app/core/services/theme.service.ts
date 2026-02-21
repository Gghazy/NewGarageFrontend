import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly LIGHT_THEME = 'light';
  private readonly DARK_THEME = 'dark';

  // Signal to track current theme
  isDarkMode = signal<boolean>(this.getStoredTheme() === this.DARK_THEME);

  constructor() {
    this.applyTheme();
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Set specific theme
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    this.applyTheme();
    this.saveTheme();
  }

  /**
   * Get current theme status
   */
  getTheme(): boolean {
    return this.isDarkMode();
  }

  /**
   * Apply theme to document
   */
  private applyTheme(): void {
    const htmlElement = document.documentElement;
    const theme = this.isDarkMode() ? this.DARK_THEME : this.LIGHT_THEME;
    
    htmlElement.setAttribute('data-theme', theme);
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(this.isDarkMode() ? 'dark-mode' : 'light-mode');
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(): void {
    const theme = this.isDarkMode() ? this.DARK_THEME : this.LIGHT_THEME;
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Get stored theme from localStorage
   */
  private getStoredTheme(): string {
    // Check localStorage first
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored) {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.DARK_THEME;
    }

    // Default to light
    return this.LIGHT_THEME;
  }
}
