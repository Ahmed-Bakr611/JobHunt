import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { JobService } from '@features/jobs/services/job.services';
import { AuthService } from '@core/services/auth.service';
import { Job, JobStatus } from '@shared/models/job.model';

@Component({
  selector: 'jb-job-management',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
  ],
  templateUrl: './job-management.component.html',
  styleUrls: ['./job-management.component.css'],
})
export class JobManagementComponent implements OnInit, OnDestroy {
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // Table data
  displayedColumns: string[] = ['title', 'type', 'status', 'applications', 'createdAt', 'actions'];
  dataSource: Job[] = [];
  filteredDataSource: Job[] = [];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // Sorting
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtering
  selectedStatus: JobStatus | 'all' = 'all';
  statusOptions: { value: JobStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Jobs' },
    { value: 'active', label: 'Active' },
    { value: 'closed', label: 'Closed' },
  ];

  // Loading state
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadJobs();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadJobs(): Promise<void> {
    try {
      this.isLoading.set(true);
      const response = await this.jobService.getAll().toPromise();
      
      if (response?.success && Array.isArray(response.data)) {
        // Filter jobs for current company
        const companyId = this.authService.userId();
        const companyJobs = response.data.filter(job => job.companyId === companyId);
        this.dataSource = companyJobs;
        this.applyFilters();
      } else {
        throw new Error(response?.error || 'Failed to load jobs');
      }
    } catch (error) {
      const errorMessage = 'Failed to load jobs. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  applyFilters(): void {
    let filtered = [...this.dataSource];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === this.selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = this.getSortValue(a, this.sortField);
      const bValue = this.getSortValue(b, this.sortField);
      
      if (this.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredDataSource = filtered;
    this.totalItems = filtered.length;
    this.pageIndex = 0; // Reset to first page
  }

  onStatusFilterChange(status: JobStatus | 'all'): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction as 'asc' | 'desc';
    this.applyFilters();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  getPaginatedData(): Job[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredDataSource.slice(start, end);
  }

  getStatusChipClass(status: JobStatus): string {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: JobStatus): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  getJobTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance',
    };
    return typeLabels[type] || type;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  viewJob(jobId: string): void {
    this.router.navigate(['/jobs', jobId]);
  }

  editJob(jobId: string): void {
    // TODO: Implement edit job functionality
    this.snackBar.open('Edit job feature coming soon!', 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  async toggleJobStatus(job: Job): Promise<void> {
    try {
      const newStatus: JobStatus = job.status === 'active' ? 'closed' : 'active';
      const response = await this.jobService.update(job.id, { status: newStatus }).toPromise();
      
      if (response?.success) {
        job.status = newStatus;
        this.applyFilters();
        this.snackBar.open(`Job ${newStatus} successfully`, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      } else {
        throw new Error(response?.error || 'Failed to update job status');
      }
    } catch (error) {
      this.snackBar.open('Failed to update job status. Please try again.', 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  async deleteJob(job: Job): Promise<void> {
    // TODO: Implement delete confirmation dialog
    const confirmed = confirm(`Are you sure you want to delete "${job.title}"? This action cannot be undone.`);
    
    if (!confirmed) return;

    try {
      const response = await this.jobService.delete(job.id).toPromise();
      
      if (response?.success) {
        this.dataSource = this.dataSource.filter(j => j.id !== job.id);
        this.applyFilters();
        this.snackBar.open('Job deleted successfully', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      } else {
        throw new Error(response?.error || 'Failed to delete job');
      }
    } catch (error) {
      this.snackBar.open('Failed to delete job. Please try again.', 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    }
  }

  viewApplicants(jobId: string): void {
    this.router.navigate(['/company/applicants'], { queryParams: { jobId } });
  }

  navigateToPostJob(): void {
    this.router.navigate(['/company/post-job']);
  }

  getJobStats() {
    const jobs = this.dataSource;
    return {
      total: jobs.length,
      active: jobs.filter(job => job.status === 'active').length,
      closed: jobs.filter(job => job.status === 'closed').length,
      totalApplications: jobs.reduce((sum, job) => sum + (job.applicationCount || 0), 0),
    };
  }

  private getSortValue(job: Job, field: string): any {
    switch (field) {
      case 'title':
        return job.title.toLowerCase();
      case 'type':
        return job.type;
      case 'status':
        return job.status;
      case 'applications':
        return job.applicationCount || 0;
      case 'createdAt':
        return new Date(job.createdAt).getTime();
      default:
        return '';
    }
  }
}
