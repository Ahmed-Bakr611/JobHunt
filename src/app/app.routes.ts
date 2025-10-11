import { Routes } from '@angular/router';
import { JobListComponent } from './features/jobs/components/job-list/job-list.component';
import { ProfileViewComponent } from './features/profile/components/profile-view/profile-view.component';
import { ProfileEditComponent } from './features/profile/components/profile-edit/profile-edit.component';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { JobDetailsComponent } from './features/jobs/components/job-details/job-details';

export const routes: Routes = [
  { path: '', redirectTo: '/jobs', pathMatch: 'full' },
  { path: 'jobs', component: JobListComponent },
  { path: 'jobs/:id', component: JobDetailsComponent },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
    ],
  },

  {
    path: 'profile',
    component: ProfileViewComponent,
    canActivate: [authGuard], // only logged in users
  },
  {
    path: 'editProfile',
    component: ProfileEditComponent,
    canActivate: [authGuard], // only logged in users
  },
];
