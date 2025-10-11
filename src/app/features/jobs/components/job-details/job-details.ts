// job-details.component.ts
import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Job } from '../../../../shared/models/job.model';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { MOCK_JOBS } from '../../../../core/mocks/jobs.mock';

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
    LoaderComponent,
    LoaderComponent,
  ],
  templateUrl: './job-details.html',
  styleUrls: ['./job-details.css'],
})
export class JobDetailsComponent implements OnInit {
  job = signal<Job | null>(null);

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Get job ID from route
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.loadJobDetails(jobId);
    }
  }

  private loadJobDetails(id: string) {
    // Replace with your actual service call
    // this.jobService.getJobById(id).subscribe(job => {
    //   this.job.set(job);
    // });
    // Mock data for now
    const mockJob = MOCK_JOBS.find((j) => j.id === id);
    this.job.set(mockJob ?? null);
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
    console.log('Apply to job:', this.job()?.id);
    // Navigate to application form or open modal
  }

  onSave() {
    console.log('Save job:', this.job()?.id);
    // Save to favorites
  }
}
