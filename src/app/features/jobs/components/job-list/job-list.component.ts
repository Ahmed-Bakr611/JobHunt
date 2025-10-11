import { Pagination } from './../../../../../FireBase/response.viewmodel';
import { LoaderComponent } from './../../../../shared/components/loader/loader.component';
import { JobService } from './../../services/job.services';
// job-list.component.ts
import { Component, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { Job, JobFilter } from '../../../../shared/models/job.model';
import { JobFiltersComponent } from '../job-filters/job-filters.component';
import { JobCardComponent } from '../job-card/job-card.component';
import { MOCK_JOBS } from '../../../../core/mocks/jobs.mock';
import { toArray } from 'rxjs';
import { ResponseVM } from '../../../../../FireBase/response.viewmodel';
import { JobFilterService } from '../../services/jobfilter.service';

@Component({
  selector: 'jb-job-list',
  imports: [
    CommonModule,
    JobFiltersComponent,
    JobCardComponent,
    LoaderComponent,
    MatPaginatorModule,
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css'],
})
export class JobListComponent {
  jobResponse = signal<ResponseVM<Job>>({
    success: false,
    data: null,
    loading: true,
    error: null,
  });

  constructor(private jobService: JobService, public jobFilterService: JobFilterService) {}

  ngOnInit() {
    this.loadJobs();
  }

  private loadJobs() {
    this.jobService.getAll().subscribe((res) => {
      this.jobResponse.set(res);
      if (res.success && Array.isArray(res.data)) {
        this.jobFilterService.setJobs(res.data);
        // this.jobFilterService.setPagination(0, 5);
      }
    });
  }

  onFiltersChanged(filters: JobFilter) {
    this.jobFilterService.setFilters(filters);
  }

  onPageChange(event: PageEvent) {
    console.log(event);
    this.jobFilterService.setPagination(event.pageIndex, event.pageSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  onCardClick(job?: Job) {
    console.log('Card clicked:', job);
    // Navigate to job details
    // this.router.navigate(['/jobs', job.id]);
  }

  onApplyClick(job?: Job) {
    console.log('Apply clicked:', job);
    // Handle apply logic
  }

  onSaveClick(job?: Job) {
    console.log('Save clicked:', job);
    // Handle save logic
  }
  ngOnDestroy() {
    this.jobFilterService.setJobs([]);
    this.jobFilterService.setFilters({});
    this.jobFilterService.setPagination(0, 10);
  }
}
