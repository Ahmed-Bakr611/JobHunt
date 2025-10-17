// src/app/core/services/cloudinary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'enviroments/enviroment';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  url: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  private cloudName = 'dc9xivxey'; // 🔑 from Cloudinary dashboard
  private uploadPreset = 'jobHunt'; // 🔑 your unsigned preset

  constructor(private http: HttpClient) {}

  uploadFile(file: File, folder: 'cvs' | 'profiles'): Observable<CloudinaryUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', `jobly/${folder}`);

    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    return this.http
      .post<CloudinaryUploadResponse>(
        `${environment.CLOUDINARY_URL}/${this.cloudName}/${resourceType}/upload`,
        formData
      )
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred while uploading the file.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Upload failed: ${error.status} - ${error.message}`;

      if (error.status === 400) {
        errorMessage = 'Invalid file or upload preset. Please check your configuration.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized upload. Please check your Cloudinary credentials.';
      } else if (error.status === 413) {
        errorMessage = 'File is too large. Please reduce the file size.';
      }
    }

    console.error('Cloudinary upload error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
