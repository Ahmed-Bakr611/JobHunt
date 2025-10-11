import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';

// Angular Material imports (standalone component)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLinkActive } from '@angular/router';

@Component({
  selector: 'jb-header',
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
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
  constructor(public auth: AuthService, private router: Router) {}

  async signOut() {
    await this.auth.signOutUser();
  }

  goToProfile() {
    // navigate to profile. If user is a company, they likely have a different area; keep it generic
    this.router.navigate(['/profile']);
  }
}
