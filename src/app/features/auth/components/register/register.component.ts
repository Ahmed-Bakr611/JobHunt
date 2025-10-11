// src/app/features/auth/components/register/register.component.ts
import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { AuthService } from '../../../../core/services/auth.service';
import { UserRole } from '../../../../shared/models/user.model';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatRadioModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);

  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  registerForm = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['seeker' as UserRole, [Validators.required]],
    },
    { validators: this.passwordMatchValidator }
  );

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }

    return null;
  }

  togglePassword(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword.update((value) => !value);
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      const { email, password, displayName, role } = this.registerForm.getRawValue();
      try {
        await this.authService.signUp(email, password, displayName, role);
      } catch (error) {
        console.error('Registration failed:', error);
      }
    }
  }

  async signUpWithGoogle(): Promise<void> {
    try {
      this.router.navigate(['/auth/role-selection'], {
        queryParams: { provider: 'google' },
      });
    } catch (error) {
      console.error('Google sign-up failed:', error);
    }
  }
}
