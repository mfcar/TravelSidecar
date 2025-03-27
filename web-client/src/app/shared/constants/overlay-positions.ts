import { ConnectedPosition } from '@angular/cdk/overlay';

/**
 * Standard positions for dropdown overlays with 8px gap
 */
export const STANDARD_DROPDOWN_POSITIONS: ConnectedPosition[] = [
  // Prioritize start (left) alignment below
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 8,
  },
  // Prioritize start (left) alignment above
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -8,
  },
  // Secondary: center alignment below
  {
    originX: 'center',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 8,
  },
  // Secondary: center alignment above
  {
    originX: 'center',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -8,
  },
  // Last resort: end (right) alignment below
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 8,
  },
  // Last resort: end (right) alignment above
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -8,
  },
];
