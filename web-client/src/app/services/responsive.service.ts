import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ResponsiveService {
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);

  constructor() {
    this.checkViewport();
    window.addEventListener('resize', () => this.checkViewport());
  }

  private checkViewport() {
    const width = window.innerWidth;
    
    // Tailwind breakpoints
    // sm: 640px
    // md: 768px
    // lg: 1024px
    // xl: 1280px
    // 2xl: 1536px
    
    this.isMobile.set(width < 640);
    this.isTablet.set(width >= 640 && width < 1024);
    this.isDesktop.set(width >= 1024);
  }
}