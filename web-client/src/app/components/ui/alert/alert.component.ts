import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

interface AlertTheme {
  border: string;
  bg: string;
  title: string;
  message: string;
  text: string;
  icon: string;
}

@Component({
  selector: 'ts-alert',
  imports: [FontAwesomeModule, NgClass],
  template: `
    <div [ngClass]="[theme.border, theme.bg, 'p-4', 'my-4', 'border-l-4']">
      <div class="flex">
        <div class="flex-shrink-0">
          <fa-icon
            class="h-5 w-5"
            [icon]="['fas', theme.icon]"
            [ngClass]="theme.text"
            [fixedWidth]="true"
            aria-hidden="true"
          />
        </div>
        <div class="ml-3">
          @if (title()) {
            <h3 class="text-sm font-medium" [ngClass]="theme.title">
              {{ title() }}
            </h3>
          }
          @if (message()) {
            <p class="text-sm" [ngClass]="theme.message">
              {{ message() }}
            </p>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  type = input.required<'success' | 'info' | 'warning' | 'error'>();
  title = input<string | null>('');
  message = input<string | null>('');

  private alertThemes: Record<string, AlertTheme> = {
    success: {
      border: 'border-green-400',
      bg: 'bg-green-50',
      title: 'text-green-800',
      message: 'text-green-700',
      text: 'text-green-400',
      icon: 'circle-check',
    },
    info: {
      border: 'border-blue-400',
      bg: 'bg-blue-50',
      title: 'text-blue-800',
      message: 'text-blue-700',
      text: 'text-blue-400',
      icon: 'circle-info',
    },
    warning: {
      border: 'border-yellow-400',
      bg: 'bg-yellow-50',
      title: 'text-yellow-800',
      message: 'text-yellow-700',
      text: 'text-yellow-400',
      icon: 'triangle-exclamation',
    },
    error: {
      border: 'border-red-400',
      bg: 'bg-red-50',
      title: 'text-red-800',
      message: 'text-red-700',
      text: 'text-red-400',
      icon: 'circle-xmark',
    },
  };

  get theme(): AlertTheme {
    return this.alertThemes[this.type() || 'info'];
  }
}
