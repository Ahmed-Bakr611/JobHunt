// job-filters.component.ts
import { Component, computed, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { Job, JobFilter, JobType, ExperienceLevel } from '../../../../shared/models/job.model';
import { FilterGroup } from '../../interfaces/FilterGroup';
@Component({
  selector: 'jb-job-filters',
  imports: [
    CommonModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSliderModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './job-filters.component.html',
  styleUrls: ['./job-filters.component.css'],
})
export class JobFiltersComponent {
  @Input() set jobs(value: Job[]) {
    this._jobs = value;
    this.updateFilterCounts();
  }

  @Output() filtersChanged = new EventEmitter<JobFilter>();

  private _jobs: Job[] = [];

  filterGroups = signal<FilterGroup[]>([]);
  salaryMin: number | null = null;
  salaryMax: number | null = null;
  remoteOnly = signal(false);
  hybridOnly = signal(false);
  remoteCount = signal(0);
  hybridCount = signal(0);

  private currentFilters: JobFilter = {};
  private pendingFilters: JobFilter = {};
  private hasChanges = signal(false);

  hasUnappliedChanges = computed(() => this.hasChanges());

  private readonly JOB_TYPE_LABELS: Record<JobType, string> = {
    'full-time': 'Full Time',
    'part-time': 'Part Time',
    contract: 'Contract',
    internship: 'Internship',
    freelance: 'Freelance',
  };

  private readonly EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
    entry: 'Entry Level',
    mid: 'Mid Level',
    senior: 'Senior',
    lead: 'Lead',
    executive: 'Executive',
  };

  ngOnInit() {
    this.initializeFilters();
  }

  private initializeFilters() {
    const jobTypes: JobType[] = ['full-time', 'part-time', 'contract', 'internship', 'freelance'];
    const experienceLevels: ExperienceLevel[] = ['entry', 'mid', 'senior', 'lead', 'executive'];

    this.filterGroups.set([
      {
        title: 'Job Type',
        key: 'type',
        expanded: true,
        options: jobTypes.map((type) => ({
          value: type,
          label: this.JOB_TYPE_LABELS[type],
          count: 0,
          selected: false,
        })),
      },
      {
        title: 'Experience Level',
        key: 'experienceLevel',
        expanded: false,
        options: experienceLevels.map((level) => ({
          value: level,
          label: this.EXPERIENCE_LABELS[level],
          count: 0,
          selected: false,
        })),
      },
    ]);

    this.updateFilterCounts();
  }

  private updateFilterCounts() {
    if (!this._jobs.length) return;

    const groups = this.filterGroups();

    // Update Job Type counts
    const jobTypeGroup = groups.find((g) => g.key === 'type');
    if (jobTypeGroup) {
      jobTypeGroup.options.forEach((option) => {
        option.count = this._jobs.filter((job) => job.type === option.value).length;
      });
    }

    // Update Experience Level counts
    const experienceGroup = groups.find((g) => g.key === 'experienceLevel');
    if (experienceGroup) {
      experienceGroup.options.forEach((option) => {
        option.count = this._jobs.filter((job) => job.experienceLevel === option.value).length;
      });
    }

    // Update location counts
    this.remoteCount.set(this._jobs.filter((job) => job.location.remote).length);
    this.hybridCount.set(this._jobs.filter((job) => job.location.hybrid).length);

    this.filterGroups.set([...groups]);
  }

  onFilterChange(key: keyof JobFilter, value: string, checked: boolean) {
    const groups = this.filterGroups();
    const group = groups.find((g) => g.key === key);

    if (group) {
      const option = group.options.find((o) => o.value === value);
      if (option) {
        option.selected = checked;
      }

      // Update pending filters
      const selectedValues = group.options.filter((o) => o.selected).map((o) => o.value);

      if (selectedValues.length > 0) {
        this.pendingFilters[key] = selectedValues as any;
      } else {
        delete this.pendingFilters[key];
      }

      this.filterGroups.set([...groups]);
      this.hasChanges.set(true);
    }
  }

  onSalaryInputChange() {
    if (this.salaryMin !== null && this.salaryMin > 0) {
      this.pendingFilters.salaryMin = this.salaryMin;
    } else {
      delete this.pendingFilters.salaryMin;
    }

    if (this.salaryMax !== null && this.salaryMax > 0) {
      this.pendingFilters.salaryMax = this.salaryMax;
    } else {
      delete this.pendingFilters.salaryMax;
    }

    this.hasChanges.set(true);
  }

  onRemoteChange(checked: boolean) {
    this.remoteOnly.set(checked);
    if (checked) {
      this.pendingFilters.remote = true;
    } else {
      delete this.pendingFilters.remote;
    }
    this.hasChanges.set(true);
  }

  onHybridChange(checked: boolean) {
    this.hybridOnly.set(checked);
    // You can add hybrid to JobFilter interface if needed
    this.hasChanges.set(true);
  }

  applyFilters() {
    this.currentFilters = { ...this.pendingFilters };
    this.hasChanges.set(false);
    this.emitFilters();
  }

  clearAllFilters() {
    // Reset all filter groups
    const groups = this.filterGroups();
    groups.forEach((group) => {
      group.options.forEach((option) => {
        option.selected = false;
      });
    });
    this.filterGroups.set([...groups]);

    // Reset salary
    this.salaryMin = null;
    this.salaryMax = null;

    // Reset location
    this.remoteOnly.set(false);
    this.hybridOnly.set(false);

    // Clear filters
    this.currentFilters = {};
    this.pendingFilters = {};
    this.hasChanges.set(false);
    this.emitFilters();
  }

  private emitFilters() {
    this.filtersChanged.emit({ ...this.currentFilters });
  }
}
