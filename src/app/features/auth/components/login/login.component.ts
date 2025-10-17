// src/app/auth/login/login.component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'jb-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  loginForm: FormGroup;
  hidePassword = signal(true);
  isLoading = signal(false);
  isSignInClicked = false;

  constructor() {
    console.log('CTOR LOGIN');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }
  async ngOnInit() {
    // console.log('INIT');
    // const res = await this.authService.checkRedirectResult();
    // console.log(res);
  }

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  getEmailErrorMessage(): string {
    const control = this.emailControl;
    if (!control || !control.dirty) {
      return '';
    }

    const value = control.value?.trim() || '';

    if (value === '') {
      return 'Email is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.passwordControl;
    if (!control || !control.dirty) {
      return '';
    }

    const value = control.value || '';

    if (value === '') {
      return 'Password is required';
    }
    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength')?.requiredLength || 6;
      const actualLength = value.length;
      return `Password must be at least ${minLength} characters (${actualLength}/${minLength})`;
    }
    return '';
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.isSignInClicked = true;

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.signIn(email, password);
      this.navigateToHome();
      this.snackBar.open('Login successful!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } catch (error) {
      const errorMessage = this.authService.error() || 'Login failed. Please try again.';
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
      this.isSignInClicked = false;
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Start Google sign-in without role - will redirect to role selection for new users
      await this.authService.signInWithGoogleForRoleSelection();
      // Navigation will be handled by the auth service based on user status
    } catch (error) {
      const errorMessage = this.authService.error() || 'Google sign-in failed. Please try again.';
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

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }
  navigateToHome(): void {
    const navTo = this.authService.isCompany() ? 'company/dashboard' : 'jobs';
    this.router.navigate([navTo]);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
