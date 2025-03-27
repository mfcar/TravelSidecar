import { NgClass } from '@angular/common';
import { booleanAttribute, ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingIndicatorComponent } from '../../ui/loading-indicator/loading-indicator.component';

@Component({
  selector: 'ts-button',
  imports: [FontAwesomeModule, LoadingIndicatorComponent, NgClass],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  ariaLabel = input<string | null>(null);
  label = input.required<string>();
  type = input<'button' | 'submit'>('button');
  variant = input<'primary' | 'secondary' | 'neutralPrimary' | 'neutralSecondary' | 'danger'>(
    'secondary',
  );
  icon = input<string | null>();
  iconPosition = input<'left' | 'right'>('left');
  size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('md');
  disabled = input(false, { transform: booleanAttribute });
  isLoading = input(false, { transform: booleanAttribute });
  fullWidth = input(false, { transform: booleanAttribute });

  buttonAction = output<void>();

  get buttonClasses(): string {
    const sizeClasses: Record<string, string> = {
      xs: 'rounded px-2 py-1 text-xs',
      sm: 'rounded px-2 py-1 text-sm',
      md: 'rounded-md px-2.5 py-1.5 text-sm',
      lg: 'rounded-md px-3 py-2 text-sm',
      xl: 'rounded-md px-3.5 py-2.5 text-sm',
    };

    const variantClasses: Record<string, string> = {
      primary:
        'shadow-sm bg-sky-600 text-white hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:focus-visible:outline-sky-500',
      secondary:
        'bg-white text-gray-900 ring-1 dark:ring-0 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
      neutralPrimary: 'text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300',
      neutralSecondary: 'text-gray-900 dark:text-white hover:text-sky-900 dark:hover:text-sky-300',
      danger:
        'bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 dark:focus-visible:outline-red-500',
    };

    const widthClass = this.fullWidth() ? 'w-full' : '';

    if (this.disabled()) {
      let disabledColor = '';
      switch (this.variant()) {
        case 'primary':
          disabledColor = 'bg-sky-400 text-white';
          break;
        case 'secondary':
          disabledColor = 'bg-gray-200 text-gray-500';
          break;
        case 'neutralPrimary':
        case 'neutralSecondary':
          disabledColor = 'text-gray-400';
          break;
        case 'danger':
          disabledColor = 'bg-red-400 text-white';
          break;
        default:
          disabledColor = 'bg-gray-400 text-gray-500';
          break;
      }
      return `font-semibold ${sizeClasses[this.size()]} ${disabledColor} opacity-50 cursor-not-allowe ${widthClass}`;
    }

    return `font-semibold ${sizeClasses[this.size()]} ${variantClasses[this.variant()]} ${widthClass}`;
  }

  onButtonClicked() {
    if (this.disabled()) return;
    this.buttonAction.emit();
  }
}
