import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';
import { UserRole } from '@shared/models/user.model';

@Component({
  selector: 'jb-role-selection',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSnackBarModule,
  ],
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.css'],
})
export class RoleSelectionComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  roleForm: FormGroup;
  isLoading = signal(false);

  constructor() {
    this.roleForm = this.fb.group({
      role: ['seeker', [Validators.required]],
    });
  }

  get selectedRole() {
    return this.roleForm.get('role')?.value;
  }

  async onRoleSelected(): Promise<void> {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const role = this.selectedRole as UserRole;

    try {
      // Complete the Google sign-in with the selected role
      await this.authService.completeGoogleSignIn(role);
      
      this.snackBar.open('Account created successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      // Navigate based on role
      const navTo = role === 'company' ? 'company/dashboard' : 'jobs';
      this.router.navigate([navTo]);
    } catch (error) {
      const errorMessage = this.authService.error() || 'Failed to complete registration. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  goBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}