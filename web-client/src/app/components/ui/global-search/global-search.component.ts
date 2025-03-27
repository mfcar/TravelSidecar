import { DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'ts-global-search',
  imports: [FormsModule, FontAwesomeModule],
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalSearchComponent implements OnInit {
  searchTerm = signal<string>('');
  dialogRef = inject(DialogRef, { optional: true });
  searchInput = viewChild<ElementRef>('searchInput');

  ngOnInit(): void {
    setTimeout(() => {
      if (this.searchInput()) {
        this.searchInput()?.nativeElement.focus();
      }
    }, 0);
  }

  onSearch(): void {
    console.log('Searching for:', this.searchTerm());
  }

  close(): void {
    this.dialogRef?.close();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
