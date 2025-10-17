import { Component, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/services/auth.service';

// Angular Material imports (standalone component)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive } from '@angular/router';

interface NavLink {
  label: string;
  route: string;
  type?: 'button' | 'stroked'; // for styling
}

@Component({
  selector: 'jb-header',
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLinkActive,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  auth = inject(AuthService);
  router = inject(Router);
  navLinks = computed<NavLink[]>(() => {
    if (!this.auth.isAuthenticated()) {
      // guest
      return [
        { label: 'Jobs', route: '/jobs' },
        { label: 'Login', route: '/auth/login', type: 'button' },
        { label: 'Register', route: '/auth/register', type: 'stroked' },
      ];
    }

    const role = this.auth.currentUser()?.role;

    if (role === 'company') {
      return [
        { label: 'Dashboard', route: '/company/dashboard' },
        { label: 'Jobs', route: '/company/jobs' },
        { label: 'Post Job', route: '/company/post-job' }
      ];
    }

    // seeker by default
    return [
      { label: 'Jobs', route: '/jobs' },
      { label: 'My Applications', route: '/applications' },
      { label: 'Profile', route: '/profile' },
    ];
  });
  async signOut() {
    await this.auth.signOutUser();
  }

  goToProfile() {
    // navigate to profile. If user is a company, they likely have a different area; keep it generic
    this.router.navigate(['/profile']);
  }
}
