import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { JobService } from '@features/jobs/services/job.services';
import { ApplicationService } from '@core/services/application.service';
import { AuthService } from '@core/services/auth.service';
import { Job } from '@shared/models/job.model';
import { Application } from '@core/services/application.service';

@Component({
  selector: 'jb-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private jobService = inject(JobService);
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  // Data
  jobs = signal<Job[]>([]);
  applications = signal<Application[]>([]);
  isLoading = signal(false);

  // Stats
  stats = signal({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentApplications: 0,
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  async loadDashboardData(): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Load jobs and applications in parallel
      await Promise.all([
        this.loadJobs(),
        this.loadApplications(),
      ]);
      
      this.calculateStats();
    } catch (error) {
      this.snackBar.open('Failed to load dashboard data', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadJobs(): Promise<void> {
    try {
      const response = await this.jobService.getAll().toPromise();
      if (response?.success && Array.isArray(response.data)) {
        const companyId = this.authService.userId();
        const companyJobs = response.data.filter(job => job.companyId === companyId);
        this.jobs.set(companyJobs);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }

  private async loadApplications(): Promise<void> {
    try {
      await this.applicationService.loadMyApplications();
      // Filter applications for current company's jobs
      const companyJobIds = this.jobs().map(job => job.id);
      const companyApplications = this.applicationService.applications().filter(
        app => companyJobIds.includes(app.jobId)
      );
      this.applications.set(companyApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  }

  private calculateStats(): void {
    const jobs = this.jobs();
    const applications = this.applications();
    
    this.stats.set({
      totalJobs: jobs.length,
      activeJobs: jobs.filter(job => job.status === 'active').length,
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === 'pending').length,
      recentApplications: applications.filter(app => {
        const appDate = new Date(app.appliedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return appDate > weekAgo;
      }).length,
    });
  }

  getRecentApplications(): Application[] {
    return this.applications()
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
      .slice(0, 5);
  }

  getJobById(jobId: string): Job | undefined {
    return this.jobs().find(job => job.id === jobId);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getApplicationStatusClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'reviewing':
        return 'status-reviewing';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  }

  getApplicationStatusLabel(status: string): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'reviewing':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  }

  navigateToJobs(): void {
    this.router.navigate(['/company/jobs']);
  }

  navigateToApplicants(): void {
    this.router.navigate(['/company/applicants']);
  }

  navigateToPostJob(): void {
    this.router.navigate(['/company/post-job']);
  }
}
