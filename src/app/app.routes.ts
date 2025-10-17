import { Routes } from '@angular/router';
import { JobListComponent } from './features/jobs/components/job-list/job-list.component';
import { JobDetailsComponent } from './features/jobs/components/job-details/job-details';
import { ProfileViewComponent } from './features/profile/components/profile-view/profile-view.component';
import { ProfileEditComponent } from './features/profile/components/profile-edit/profile-edit.component';
import { DashboardComponent } from './features/company/components/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },

  // open for guests
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },

  // auth routes
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  // seeker-only routes
  {
    path: 'profile',
    component: ProfileViewComponent,
    canActivate: [authGuard],
  },
  {
    path: 'editProfile',
    component: ProfileEditComponent,
    canActivate: [authGuard],
  },

  // company-only routes
  {
    path: 'company/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard, roleGuard(['company'])],
  },
];
