import { Injectable, signal } from '@angular/core';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  title?: string;
  lifeInSeconds?: number;
}

export interface ToastMessage extends ToastOptions {
  id: string;
}

export enum ToastType {
  SUCCESS = 'success',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);

  show(options: ToastOptions) {
    const toast: ToastMessage = {
      id: Math.random().toString(36).substring(2, 15),
      ...options,
    };

    this.toasts.update((toasts) => [...toasts, toast]);

    const life = toast.lifeInSeconds ?? 4;
    setTimeout(() => this.remove(toast), life * 1000);
  }

  remove(toast: ToastMessage) {
    this.toasts.update((toasts) => toasts.filter((t) => t !== toast));
  }

  showSuccess(message: string, title = 'Success') {
    this.show({ message, title, type: ToastType.SUCCESS });
  }

  showInfo(message: string, title = 'Info') {
    this.show({ message, title, type: ToastType.INFO });
  }

  showWarn(message: string, title = 'Warning') {
    this.show({ message, title, type: ToastType.WARN });
  }

  showError(message: string, title = 'Error') {
    this.show({ message, title, type: ToastType.ERROR });
  }
}
