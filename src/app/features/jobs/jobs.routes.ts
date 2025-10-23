// src/app/features/jobs/jobs.routes.ts
import { Routes } from '@angular/router';

export const JOBS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/job-list/job-list.component').then((m) => m.JobListComponent),
  },
  {
    path: 'search',
    loadComponent: () =>
      import('./components/job-search/job-search.component').then((m) => m.JobSearchComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/job-details/job-details').then((m) => m.JobDetailsComponent),
  },

  {
    path: 'apply',
    loadComponent: () =>
      import('./components/job-application-dialog/job-application-dialog.component').then(
        (m) => m.JobApplicationDialogComponent
      ),
  },
];
