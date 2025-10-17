// job-details.component.ts
import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Job } from '../../../../shared/models/job.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { MOCK_JOBS } from '../../../../core/mocks/jobs.mock';
import { ApplicationService } from '@core/services/application.service';
import { AuthService } from '@core/services/auth.service';
import { JobApplicationDialogComponent } from '../job-application-dialog/job-application-dialog.component';

@Component({
  selector: 'jb-job-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    LoaderComponent,
  ],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css'],
})
export class JobDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);

  job = signal<Job | null>(null);
  hasApplied = signal(false);
  isLoading = signal(false);

  ngOnInit() {
    // Get job ID from route
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJobDetails(jobId);
    }
  }

  private async loadJobDetails(id: string) {
    this.isLoading.set(true);
    try {
      // Load applications to check if user has applied
      await this.applicationService.loadMyApplications();
      
      // Mock data for now - replace with actual service call
      const mockJob = MOCK_JOBS.find((j) => j.id === id);
      this.job.set(mockJob ?? null);
      
      // Check if user has applied to this job
      if (mockJob) {
        this.hasApplied.set(this.applicationService.hasAppliedToJob(mockJob.id));
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getLocationString(): string {
    const location = this.job()?.location;
    if (!location) return '';

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    if (location.remote) parts.push('Remote');
    if (location.hybrid) parts.push('Hybrid');

    return parts.join(', ');
  }

  getJobTypeLabel(): string {
    const typeLabels: Record<string, string> = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance',
    };
    return typeLabels[this.job()?.type || ''] || '';
  }

  formatSalary(): string {
    const salary = this.job()?.salary;
    if (!salary) return '';

    const format = (num: number) => num.toLocaleString();
    const period = salary.period || 'yearly';

    return `${salary.currency} ${format(salary.min)} - ${format(salary.max)} / ${period}`;
  }

  goBack() {
    this.router.navigate(['/jobs']);
  }

  onApply() {
    const job = this.job();
    if (!job) return;

    if (!this.authService.isAuthenticated()) {
      this.snackBar.open('Please log in to apply for jobs', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.hasApplied()) {
      this.snackBar.open('You have already applied to this job', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    // Open application dialog
    const dialogRef = this.dialog.open(JobApplicationDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { job },
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Application was submitted successfully
        this.hasApplied.set(true);
        this.snackBar.open('Application submitted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      }
    });
  }

  onSave() {
    console.log('Save job:', this.job()?.id);
    // TODO: Implement save to favorites functionality
    this.snackBar.open('Save to favorites feature coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getApplicationStatus(): string {
    const job = this.job();
    if (!job || !this.hasApplied()) return '';

    const application = this.applicationService.getApplicationForJob(job.id);
    if (!application) return '';

    switch (application.status) {
      case 'pending':
        return 'Application Pending';
      case 'reviewing':
        return 'Under Review';
      case 'accepted':
        return 'Application Accepted';
      case 'rejected':
        return 'Application Rejected';
      default:
        return 'Application Submitted';
    }
  }
}
