// src/app/features/test-upload/test-upload.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloudinaryService } from '@core/services/cloudinary.service';

interface UploadedFile {
  url: string;
  isImage: boolean;
  folder: string;
  uploading: boolean;
}

@Component({
  selector: 'jb-test-upload',
  imports: [CommonModule],
  template: `
    <h2>Upload Test</h2>

    <div style="margin-bottom: 20px;">
      <label>Profile Picture:</label>
      <input
        type="file"
        (change)="onFileSelected($event, 'profiles')"
        accept="image/*"
        #profileInput
      />
      <button
        (click)="upload('profiles')"
        [disabled]="!profileFile || profileUploading"
        style="margin-left: 10px;"
      >
        {{ profileUploading ? 'Uploading...' : 'Upload Profile' }}
      </button>
    </div>

    <div style="margin-bottom: 20px;">
      <label>CV (PDF/DOC):</label>
      <input
        type="file"
        (change)="onFileSelected($event, 'cvs')"
        accept=".pdf,.doc,.docx"
        #cvInput
      />
      <button
        (click)="upload('cvs')"
        [disabled]="!cvFile || cvUploading"
        style="margin-left: 10px;"
      >
        {{ cvUploading ? 'Uploading...' : 'Upload CV' }}
      </button>
    </div>

    <hr style="margin: 30px 0;" />

    <h3>Uploaded Files:</h3>

    @if (profileUrl) {
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
      <h4>Profile Picture:</h4>
      <p>✅ Uploaded to Cloudinary!</p>
      <a [href]="profileUrl" target="_blank" rel="noopener noreferrer">{{ profileUrl }}</a>
      <div style="margin-top: 10px;">
        <img [src]="profileUrl" width="200" alt="Profile picture" style="border: 1px solid #ccc;" />
      </div>
    </div>
    } @if (cvUrl) {
    <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
      <h4>CV Document:</h4>
      <p>✅ Uploaded to Cloudinary!</p>
      <a [href]="cvUrl" target="_blank" rel="noopener noreferrer">{{ cvUrl }}</a>
      <p style="margin-top: 10px;">📄 PDF/Document file</p>
    </div>
    } @if (!profileUrl && !cvUrl) {
    <p style="color: #999;">No files uploaded yet</p>
    }
  `,
})
export class TestUploadComponent {
  // Separate state for each upload type
  profileFile: File | null = null;
  cvFile: File | null = null;

  profileUrl: string | null = null;
  cvUrl: string | null = null;

  profileUploading = false;
  cvUploading = false;

  constructor(private cloudinaryService: CloudinaryService) {}

  onFileSelected(event: Event, folder: 'cvs' | 'profiles') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (folder === 'profiles') {
        this.profileFile = file;
        this.profileUrl = null; // Reset previous upload
      } else {
        this.cvFile = file;
        this.cvUrl = null; // Reset previous upload
      }
    }
  }

  upload(folder: 'cvs' | 'profiles') {
    const file = folder === 'profiles' ? this.profileFile : this.cvFile;

    if (!file) return;

    // Set uploading state
    if (folder === 'profiles') {
      this.profileUploading = true;
    } else {
      this.cvUploading = true;
    }

    this.cloudinaryService.uploadFile(file, folder).subscribe({
      next: (res) => {
        console.log('Upload response:', res);

        if (folder === 'profiles') {
          this.profileUrl = res.secure_url;
          this.profileUploading = false;
        } else {
          this.cvUrl = res.secure_url;
          this.cvUploading = false;
        }
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Upload failed: ' + (err.error?.error?.message || err.message));

        if (folder === 'profiles') {
          this.profileUploading = false;
        } else {
          this.cvUploading = false;
        }
      },
    });
  }
}
