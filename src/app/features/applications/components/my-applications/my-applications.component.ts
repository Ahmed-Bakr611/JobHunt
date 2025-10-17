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
import { ApplicationService, Application, ApplicationStatus } from '@core/services/application.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'jb-my-applications',
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
  ],
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css'],
})
export class MyApplicationsComponent implements OnInit, OnDestroy {
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Table data
  displayedColumns: string[] = ['jobTitle', 'companyName', 'status', 'appliedAt', 'actions'];
  dataSource: Application[] = [];
  filteredDataSource: Application[] = [];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  // Sorting
  sortField = 'appliedAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Filtering
  selectedStatus: ApplicationStatus | 'all' = 'all';
  statusOptions: { value: ApplicationStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Under Review' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ];

  // Loading state
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadApplications();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  async loadApplications(): Promise<void> {
    try {
      this.isLoading.set(true);
      await this.applicationService.loadMyApplications();
      
      // Update data source
      this.dataSource = this.applicationService.myApplications();
      this.applyFilters();
    } catch (error) {
      const errorMessage = this.applicationService.error() || 'Failed to load applications';
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
      filtered = filtered.filter(app => app.status === this.selectedStatus);
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

  onStatusFilterChange(status: ApplicationStatus | 'all'): void {
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

  getPaginatedData(): Application[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredDataSource.slice(start, end);
  }

  getStatusChipClass(status: ApplicationStatus): string {
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

  getStatusLabel(status: ApplicationStatus): string {
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

  getApplicationStats() {
    const applications = this.applicationService.myApplications();
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewing: applications.filter(app => app.status === 'reviewing').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
    };
  }

  private getSortValue(application: Application, field: string): any {
    switch (field) {
      case 'jobTitle':
        return application.jobTitle.toLowerCase();
      case 'companyName':
        return application.companyName.toLowerCase();
      case 'status':
        return application.status;
      case 'appliedAt':
        return new Date(application.appliedAt).getTime();
      default:
        return '';
    }
  }
}