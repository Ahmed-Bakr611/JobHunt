// src/app/features/auth/components/register/register.component.ts
import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { BreakpointObserver } from '@angular/cdk/layout';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { SeekerProfile, CompanyProfile, UserRole } from '@shared/models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'jb-register',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    MatProgressBarModule,
    MatChipsModule,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private cloudinaryService = inject(CloudinaryService);
  private breakpointObserver = inject(BreakpointObserver);

  // Form groups for each step
  accountFormGroup!: FormGroup;
  roleFormGroup!: FormGroup;
  seekerProfileFormGroup!: FormGroup;
  companyProfileFormGroup!: FormGroup;
  uploadFormGroup!: FormGroup;

  // Stepper orientation based on screen size
  stepperOrientation: Observable<StepperOrientation>;

  // Signal for password visibility
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);

  // Selected role
  selectedRole: UserRole = 'seeker';

  // Loading state
  isLoading = false;

  // File upload states
  profileImageFile: File | null = null;
  profileImagePreview: string | null = null;
  profileImageUploading = false;
  profileImageProgress = 0;
  profileImageUrl: string | null = null;

  cvFile: File | null = null;
  cvFileName: string | null = null;
  cvUploading = false;
  cvProgress = 0;
  cvUrl: string | null = null;

  constructor() {
    this.stepperOrientation = this.breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnDestroy(): void {
    console.log(this.uploadFormGroup);
  }

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Step 1: Account credentials
    this.accountFormGroup = this.fb.group(
      {
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
        }),
        password: this.fb.control('', {
          validators: [Validators.required, Validators.minLength(6)],
        }),
        confirmPassword: this.fb.control('', {
          validators: [Validators.required],
        }),
      },
      { validators: this.passwordMatchValidator }
    );

    // Step 2: Role selection
    this.roleFormGroup = this.fb.group({
      role: ['seeker', Validators.required],
    });

    // Step 3a: Seeker profile
    this.seekerProfileFormGroup = this.fb.group({
      displayName: ['', Validators.required],
      phone: [''],
      location: [''],
      bio: [''],
      skills: [''],
      experience: [''],
      education: [''],
      linkedIn: [''],
      github: [''],
      portfolio: [''],
    });

    // Step 3b: Company profile
    this.companyProfileFormGroup = this.fb.group({
      displayName: ['', Validators.required],
      companyName: ['', Validators.required],
      industry: [''],
      companySize: [''],
      website: [''],
      description: [''],
      location: [''],
      foundedYear: ['', [Validators.min(1800), Validators.max(new Date().getFullYear())]],
      linkedIn: [''],
      twitter: [''],
    });

    // Step 4: File uploads (optional but create the form)
    this.uploadFormGroup = this.fb.group({
      profileImage: [null],
      cv: [null],
    });

    // Listen to role changes
    this.roleFormGroup.get('role')?.valueChanges.subscribe((role: UserRole) => {
      this.selectedRole = role;
    });
  }

  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (password && confirmPassword) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
      } else {
        if (confirmPassword.hasError('passwordMismatch')) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  // Profile Image Upload
  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should not exceed 5MB');
        return;
      }

      this.profileImageFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profileImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Upload immediately
      this.uploadProfileImage();
    }
  }

  private uploadProfileImage(): void {
    if (!this.profileImageFile) return;

    this.profileImageUploading = true;
    this.profileImageProgress = 0;

    this.cloudinaryService.uploadFile(this.profileImageFile, 'profiles').subscribe({
      next: (response) => {
        this.profileImageUrl = response.secure_url;
        this.profileImageUploading = false;
        this.profileImageProgress = 100;
        this.uploadFormGroup.patchValue({ profileImage: this.profileImageUrl });
      },
      error: (error) => {
        console.error('Profile image upload failed:', error);
        this.profileImageUploading = false;
        alert('Failed to upload profile image. Please try again.');
      },
    });
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    this.profileImageUrl = null;
    this.profileImageProgress = 0;
    this.uploadFormGroup.patchValue({ profileImage: null });
  }

  // CV Upload
  onCvSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type (PDF, DOC, DOCX)
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!validTypes.includes(file.type)) {
        alert('Please select a PDF or Word document');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('CV size should not exceed 10MB');
        return;
      }

      this.cvFile = file;
      this.cvFileName = file.name;

      // Upload immediately
      this.uploadCv();
    }
  }

  private uploadCv(): void {
    if (!this.cvFile) return;

    this.cvUploading = true;
    this.cvProgress = 0;

    this.cloudinaryService.uploadFile(this.cvFile, 'cvs').subscribe({
      next: (response) => {
        this.cvUrl = response.secure_url;
        this.cvUploading = false;
        this.cvProgress = 100;
        this.uploadFormGroup.patchValue({ cv: this.cvUrl });
      },
      error: (error) => {
        console.error('CV upload failed:', error);
        this.cvUploading = false;
        alert('Failed to upload CV. Please try again.');
      },
    });
  }

  removeCv(): void {
    this.cvFile = null;
    this.cvFileName = null;
    this.cvUrl = null;
    this.cvProgress = 0;
    this.uploadFormGroup.patchValue({ cv: null });
  }

  async onSubmit(): Promise<void> {
    if (this.isLoading) return;
    console.log(this.fb);

    const accountData = this.accountFormGroup.value;
    const role = this.roleFormGroup.value.role;

    let displayName = '';
    if (role === 'seeker') {
      displayName = this.seekerProfileFormGroup.value.displayName;
    } else {
      displayName = this.companyProfileFormGroup.value.displayName;
    }

    try {
      this.isLoading = true;

      // Prepare additional data based on role
      let additionalData: Partial<SeekerProfile | CompanyProfile>;

      if (role === 'seeker') {
        additionalData = this.prepareSeekerData();
      } else {
        additionalData = this.prepareCompanyData();
      }

      // Create user account with profile data in one call
      await this.authService.signUp(
        accountData.email,
        accountData.password,
        displayName,
        role,
        additionalData
      );

      // Navigation is handled by AuthService
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private prepareSeekerData(): Partial<SeekerProfile> {
    const profileData = this.seekerProfileFormGroup.value;
    const updates: Partial<SeekerProfile> = {};

    // Add uploaded file URL
    if (this.profileImageUrl) {
      updates.photoURL = this.profileImageUrl;
    }
    if (this.cvUrl) {
      updates.resumeURL = this.cvUrl;
    }

    // Only add non-empty fields
    if (profileData.phone?.trim()) updates.phone = profileData.phone;
    if (profileData.location?.trim()) updates.location = profileData.location;
    if (profileData.bio?.trim()) updates.bio = profileData.bio;
    if (profileData.skills?.trim()) {
      updates.skills = profileData.skills.split(',').map((s: string) => s.trim());
    } else {
      updates.skills = [];
    }
    if (profileData.experience?.trim()) updates.experience = profileData.experience;
    if (profileData.education?.trim()) updates.education = profileData.education;
    if (profileData.linkedIn?.trim()) updates.linkedIn = profileData.linkedIn;
    if (profileData.github?.trim()) updates.github = profileData.github;
    if (profileData.portfolio?.trim()) updates.portfolio = profileData.portfolio;

    return updates;
  }

  private prepareCompanyData(): Partial<CompanyProfile> {
    const profileData = this.companyProfileFormGroup.value;
    const updates: Partial<CompanyProfile> = {
      companyName: profileData.companyName || '',
    };

    // Add uploaded image URL as company logo
    if (this.profileImageUrl) {
      updates.companyLogo = this.profileImageUrl;
    }

    // Only add non-empty fields
    if (profileData.industry?.trim()) updates.industry = profileData.industry;
    if (profileData.companySize?.trim()) updates.companySize = profileData.companySize;
    if (profileData.website?.trim()) updates.website = profileData.website;
    if (profileData.description?.trim()) updates.description = profileData.description;
    if (profileData.location?.trim()) updates.location = profileData.location;
    if (profileData.foundedYear) updates.foundedYear = profileData.foundedYear;
    if (profileData.linkedIn?.trim()) updates.linkedIn = profileData.linkedIn;
    if (profileData.twitter?.trim()) updates.twitter = profileData.twitter;

    return updates;
  }

  get companySizeOptions() {
    return ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
  }

  get currentYear() {
    return new Date().getFullYear();
  }

  get isFinalStepValid(): boolean {
    return (
      this.accountFormGroup.valid &&
      this.roleFormGroup.valid &&
      (this.selectedRole === 'seeker'
        ? this.seekerProfileFormGroup.valid
        : this.companyProfileFormGroup.valid)
    );
  }

  get isUploading(): boolean {
    return this.profileImageUploading || this.cvUploading;
  }
}
