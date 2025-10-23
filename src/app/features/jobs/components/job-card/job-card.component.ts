// src/app/features/jobs/components/job-card/job-card.component.ts
import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Job } from '../../../../shared/models/job.model';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { SalaryFormatPipe } from '../../../../shared/pipes/salary-format-pipe';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { JobApplicationDialogComponent } from '../job-application-dialog/job-application-dialog.component';

@Component({
  selector: 'jb-job-card',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    TimeAgoPipe,
    SalaryFormatPipe,
  ],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCardComponent {
  job = input<Job>();
  showActions = input<boolean>(true);

  cardClick = output<Job | undefined>();
  applyClick = output<Job | undefined>();
  saveClick = output<Job | undefined>();
  constructor(private router: Router, private dialog: MatDialog) {}

  onCardClick(): void {
    const currentJob = this.job();

    // Emit the event (for analytics, tracking, etc.)
    this.cardClick.emit(currentJob);

    // Navigate to job details
    if (currentJob?.id) {
      this.router.navigate(['/jobs', currentJob.id]);
    }
  }

  onApplyClick(event: Event): void {
    event.stopPropagation();
    // this.applyClick.emit(this.job());
    // this.router.navigate(['/jobs/apply']);
    const dialogRef = this.dialog.open(JobApplicationDialogComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.job = this.job;

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('✅ Application submitted for:', this.job()?.title);
      }
    });
  }

  onSaveClick(event: Event): void {
    event.stopPropagation();
    this.saveClick.emit(this.job());
  }

  getLocationString(): string {
    const location = this.job()?.location;
    if (!location) return 'Not specified';

    const { city, country, remote, hybrid } = location;

    if (remote) return 'Remote';
    if (hybrid) return `${city || country || 'Hybrid'} (Hybrid)`;

    return [city, country].filter(Boolean).join(', ') || 'Not specified';
  }

  getJobTypeLabel(): string {
    const jobType = this.job()?.type;
    if (!jobType) return 'Not specified';

    const labels: Record<string, string> = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      contract: 'Contract',
      internship: 'Internship',
      freelance: 'Freelance',
    };
    return labels[jobType] || jobType;
  }
}
