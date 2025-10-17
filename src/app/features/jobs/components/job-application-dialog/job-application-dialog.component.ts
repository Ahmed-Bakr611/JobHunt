import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApplicationService, CreateApplicationData } from '@core/services/application.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { Job } from '@shared/models/job.model';

@Component({
  selector: 'jb-job-application-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  templateUrl: './job-application-dialog.component.html',
  styleUrls: ['./job-application-dialog.component.css'],
})
export class JobApplicationDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private cloudinaryService = inject(CloudinaryService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<JobApplicationDialogComponent>);

  job!: Job;
  applicationForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);

  // File upload states
  resumeFile: File | null = null;
  resumeFileName: string | null = null;
  resumeUploading = false;
  resumeProgress = 0;
  resumeUrl: string | null = null;

  constructor() {
    this.applicationForm = this.fb.group({
      coverLetter: ['', [Validators.required, Validators.minLength(50)]],
      resume: [null],
    });
  }

  ngOnInit(): void {
    // Check if user has already applied
    if (this.applicationService.hasAppliedToJob(this.job.id)) {
      this.snackBar.open('You have already applied to this job', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      this.dialogRef.close();
    }
  }

  onResumeSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type (PDF, DOC, DOCX)
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        this.snackBar.open('Please select a PDF or Word document', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('Resume size should not exceed 10MB', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      this.resumeFile = file;
      this.resumeFileName = file.name;

      // Upload immediately
      this.uploadResume();
    }
  }

  private uploadResume(): void {
    if (!this.resumeFile) return;

    this.resumeUploading = true;
    this.resumeProgress = 0;

    this.cloudinaryService.uploadFile(this.resumeFile, 'resumes').subscribe({
      next: (response) => {
        this.resumeUrl = response.secure_url;
        this.resumeUploading = false;
        this.resumeProgress = 100;
        this.applicationForm.patchValue({ resume: this.resumeUrl });
        this.snackBar.open('Resume uploaded successfully', 'Close', {
          duration: 2000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (error) => {
        console.error('Resume upload failed:', error);
        this.resumeUploading = false;
        this.snackBar.open('Failed to upload resume. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  removeResume(): void {
    this.resumeFile = null;
    this.resumeFileName = null;
    this.resumeUrl = null;
    this.resumeProgress = 0;
    this.applicationForm.patchValue({ resume: null });
  }

  async onSubmit(): Promise<void> {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    try {
      const applicationData: CreateApplicationData = {
        jobId: this.job.id,
        companyId: this.job.companyId,
        jobTitle: this.job.title,
        companyName: this.job.companyName,
        resumeURL: this.resumeUrl,
        coverLetter: this.applicationForm.value.coverLetter,
      };

      await this.applicationService.applyToJob(applicationData);

      this.snackBar.open('Application submitted successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      this.dialogRef.close(true); // Return true to indicate success
    } catch (error) {
      const errorMessage = this.applicationService.error() || 'Failed to submit application. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  get coverLetterControl() {
    return this.applicationForm.get('coverLetter');
  }

  getCoverLetterErrorMessage(): string {
    const control = this.coverLetterControl;
    if (!control || !control.dirty) {
      return '';
    }

    if (control.hasError('required')) {
      return 'Cover letter is required';
    }
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength')?.requiredLength || 50;
      const actualLength = control.value?.length || 0;
      return `Cover letter must be at least ${minLength} characters (${actualLength}/${minLength})`;
    }
    return '';
  }

  getLocationString(): string {
    const location = this.job?.location;
    if (!location) return '';

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    if (location.remote) parts.push('Remote');
    if (location.hybrid) parts.push('Hybrid');

    return parts.join(', ');
  }
}
