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
  faCheck,
  faChevronDown,
  faCircleCheck,
  faCircleExclamation,
  faCircleInfo,
  faCircleXmark,
  faClipboardList,
  faCog,
  faFolderPlus,
  faGrip,
  faHome,
  faList,
  faMagnifyingGlass,
  faMoon,
  faPlaneDeparture,
  faPlus,
  faSpinner,
  faSun,
  faTable,
  faTags,
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
      faChevronDown,
      faMagnifyingGlass,
      faMoon,
      faSun,
      faXmark,
      faCheck,
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
      faPlaneDeparture,
      faTags,
      faClipboardList,
      faUsers,
      faCog,
      faGrip,
      faArrowDown,
    );
  }
}
