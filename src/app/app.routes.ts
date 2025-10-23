// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ProfileViewComponent } from './features/profile/components/profile-view/profile-view.component';
import { DashboardComponent } from './features/company/components/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },

  // ✅ Lazy-load the jobs feature routes
  {
    path: 'jobs',
    loadChildren: () => import('./features/jobs/jobs.routes').then((m) => m.JOBS_ROUTES),
  },

  // Auth routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  // Seeker-only routes
  {
    path: 'profile',
    component: ProfileViewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editProfile',
    loadComponent: () =>
      import('./features/profile/components/profile-edit/profile-edit.component').then(
        (m) => m.ProfileEditComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'applications',
    loadComponent: () =>
      import('./features/applications/components/my-applications/my-applications.component').then(
        (m) => m.MyApplicationsComponent
      ),
    canActivate: [authGuard],
  },

  // Company-only routes
  {
    path: 'company/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard(['company'])],
  },
  {
    path: 'company/post-job',
    loadComponent: () =>
      import('./features/company/components/job-posting/job-posting.component').then(
        (m) => m.JobPostingComponent
      ),
    canActivate: [authGuard, roleGuard(['company'])],
  },
  {
    path: 'company/jobs',
    loadComponent: () =>
      import('./features/company/components/job-management/job-management.component').then(
        (m) => m.JobManagementComponent
      ),
    canActivate: [authGuard, roleGuard(['company'])],
  },
];
