// jobfilter.service.ts
import { Injectable, signal, computed } from '@angular/core';
import { Job, JobFilter } from '../../../shared/models/job.model';

@Injectable({ providedIn: 'root' })
export class JobFilterService {
  private allJobs = signal<Job[]>([]);
  private activeFilters = signal<JobFilter>({});

  // pagination state
  private pageIndex = signal(0);
  private pageSize = signal(5);

  setJobs(jobs: Job[]) {
    this.allJobs.set(jobs);
  }

  setFilters(filters: JobFilter) {
    this.activeFilters.set(filters);
    this.pageIndex.set(0); // reset page when filters change
  }

  setPagination(pageIndex: number, pageSize: number) {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
  }

  readonly filteredJobs = computed(() => {
    const jobs = this.allJobs();
    const filters = this.activeFilters();

    if (!filters || Object.keys(filters).length === 0) return jobs;
    return jobs.filter((job) => this.matchesFilters(job, filters));
  });

  readonly pagination = computed(() => {
    return { pageIndex: this.pageIndex(), pageSize: this.pageSize() };
  });

  readonly paginatedJobs = computed(() => {
    const jobs = this.filteredJobs();
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return jobs.slice(start, end);
  });

  readonly jobsCount = computed(() => this.filteredJobs().length);

  private matchesFilters(job: Job, filters: JobFilter): boolean {
    if (filters.type?.length && !filters.type.includes(job.type)) return false;

    if (
      filters.experienceLevel?.length &&
      (!job.experienceLevel || !filters.experienceLevel.includes(job.experienceLevel))
    ) {
      return false;
    }

    // Salary Min filter
    if (typeof filters.salaryMin === 'number' && job.salary?.max != null) {
      if (job.salary.max < filters.salaryMin) return false;
    }

    // Salary Max filter
    if (typeof filters.salaryMax === 'number' && job.salary?.min != null) {
      if (job.salary.min > filters.salaryMax) return false;
    }

    // Remote filter
    if (filters.remote && !job.location?.remote) return false;

    // Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const searchable = [job.title, job.description, job.companyName, ...(job.skills || [])]
        .join(' ')
        .toLowerCase();

      if (!searchable.includes(query)) return false;
    }

    return true;
  }
}
