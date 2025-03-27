import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/files`;

  uploadBucketListItemImage(bucketListItemId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(
      `${this.apiUrl}/bucket-list-item/${bucketListItemId}/image`,
      formData,
    );
  }
}
