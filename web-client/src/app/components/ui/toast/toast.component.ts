import {
  animate,
  animateChild,
  query,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastService, ToastType } from '../../../services/toast.service';

@Component({
  selector: 'ts-toast',
  imports: [FontAwesomeModule, NgClass],
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('slideIn', [
      state(
        '*',
        style({
          transform: 'translateY(0) scale(1) rotateY(0)',
          opacity: 1,
          filter: 'blur(0) saturate(100%)',
        }),
      ),
      state(
        'void',
        style({
          transform: 'translateY(20px) scale(1.1) rotateY(5deg)',
          opacity: 0,
          filter: 'blur(2px) saturate(50%)',
        }),
      ),
      transition('void => *', animate('.3s ease-in-out')),
    ]),
    trigger('slideOut', [
      state(
        '*',
        style({
          transform: 'translateX(0)  scale(1)',
          opacity: 1,
        }),
      ),
      state(
        'void',
        style({
          transform: 'translateX(100%) scale(.7)',
          opacity: 0,
        }),
      ),
      transition('* => void', animate('.2s ease')),
    ]),
    trigger('listCollapse', [
      state(
        '*',
        style({
          height: '*',
        }),
      ),
      state(
        'void',
        style({
          height: '0',
        }),
      ),
      transition('* => void', animate('.3s .3s ease')),
    ]),
    trigger('triggerChildAnimation', [
      transition(':enter, :leave', [animate('0s'), query('*', [animateChild()])]),
    ]),
  ],
})
export class ToastComponent {
  toastsService = inject(ToastService);

  protected readonly ToastType = ToastType;
}
