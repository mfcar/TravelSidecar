import { inject, Injectable } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowDown91,
  faArrowDownZA,
  faArrowUp,
  faArrowUp91,
  faArrowUpZA,
  faBars,
  faBucket,
  faCalendar,
  faCalendarCheck,
  faCalendarDays,
  faCalendarMinus,
  faCalendarPlus,
  faCalendarXmark,
  faCheck,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faClipboardList,
  faClock,
  faCog,
  faEye,
  faEyeSlash,
  faFolderPlus,
  faGrip,
  faGripLines,
  faHome,
  faImage,
  faImages,
  faInfinity,
  faList,
  faMagnifyingGlass,
  faMap,
  faMapMarkedAlt,
  faMapMarkerAlt,
  faMoon,
  faPencil,
  faPlane,
  faPlaneDeparture,
  faPlus,
  faQuestionCircle,
  faSpinner,
  faSun,
  faTable,
  faTags,
  faTrash,
  faTriangleExclamation,
  faUsers,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root',
})
export class IconRegistryService {
  private library = inject(FaIconLibrary);

  registerIcons(): void {
    this.library.addIcons(
      faBars,
      faCalendarCheck,
      faCalendarDays,
      faCalendarMinus,
      faCalendarPlus,
      faCalendarXmark,
      faCheck,
      faCheckCircle,
      faChevronDown,
      faChevronUp,
      faChevronRight,
      faChevronLeft,
      faClock,
      faMap,
      faMagnifyingGlass,
      faMoon,
      faSun,
      faXmark,
      faPlus,
      faSpinner,
      faCircleCheck,
      faCircleExclamation,
      faCircleInfo,
      faTriangleExclamation,
      faCircleXmark,
      faArrowUpZA,
      faArrowDownZA,
      faArrowUp91,
      faArrowDown91,
      faFolderPlus,
      faTable,
      faArrowUp,
      faList,
      faHome,
      faInfinity,
      faPlane,
      faPlaneDeparture,
      faTags,
      faClipboardList,
      faUsers,
      faCog,
      faGrip,
      faArrowDown,
      faBucket,
      faEye,
      faEyeSlash,
      faPencil,
      faImage,
      faImages,
      faTrash,
      faMapMarkerAlt,
      faGripLines,
      faCalendar,
      faMapMarkedAlt,
      faQuestionCircle,
    );
  }
}
