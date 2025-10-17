import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '@core/services/auth.service';
import { ProfileService } from '@core/services/profile.service';
import { CloudinaryService } from '@core/services/cloudinary.service';
import { FormChangeDetectionService } from '@core/services/formChangeDetection.service';
import { SeekerProfile, CompanyProfile, UserRole } from '@shared/models/user.model';

@Component({
  selector: 'jb-profile-edit',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.css'],
})
export class ProfileEditComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private cloudinaryService = inject(CloudinaryService);
  private changeDetectionService = inject(FormChangeDetectionService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  private readonly TRACKER_ID = 'profile-edit-form';

  // Form
  profileForm: FormGroup;
  isSubmitting = signal(false);
  isLoading = signal(false);

  // Change detection - from service
  hasChanges = signal(false);

  // User data
  userRole = signal<UserRole | null>(null);
  currentProfile = signal<SeekerProfile | CompanyProfile | null>(null);

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

  // Options
  companySizeOptions = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  constructor() {
    this.profileForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  ngOnDestroy(): void {
    // Cleanup change detection tracker
    this.changeDetectionService.stopTracking(this.TRACKER_ID);
  }

  async loadUserProfile(): Promise<void> {
    try {
      this.isLoading.set(true);

      const role = this.authService.userRole();
      this.userRole.set(role);

      if (role === 'seeker') {
        const profile = this.authService.seekerProfile();
        this.currentProfile.set(profile);
        this.initializeSeekerForm(profile);
      } else if (role === 'company') {
        const profile = this.authService.companyProfile();
        this.currentProfile.set(profile);
        this.initializeCompanyForm(profile);
      }
    } catch (error) {
      this.snackBar.open('Failed to load profile', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isLoading.set(false);
    }
  }

  private initializeSeekerForm(profile: SeekerProfile | null): void {
    this.profileForm = this.fb.group({
      displayName: [profile?.displayName || '', [Validators.required]],
      phone: [profile?.phone || ''],
      location: [profile?.location || ''],
      bio: [profile?.bio || ''],
      skills: [profile?.skills?.join(', ') || ''],
      experience: [profile?.experience || ''],
      education: [profile?.education || ''],
      linkedIn: [profile?.linkedIn || ''],
      github: [profile?.github || ''],
      portfolio: [profile?.portfolio || ''],
    });

    // Set existing files
    if (profile?.photoURL) {
      this.profileImageUrl = profile.photoURL;
    }
    if (profile?.resumeURL) {
      this.cvUrl = profile.resumeURL;
    }

    // Start tracking changes with service
    const changesSignal = this.changeDetectionService.startTracking(
      this.TRACKER_ID,
      this.profileForm,
      {
        additionalFields: {
          profileImageUrl: this.profileImageUrl,
          cvUrl: this.cvUrl,
        },
      }
    );

    // Update local signal when service signal changes
    this.hasChanges = changesSignal as any;
  }

  private initializeCompanyForm(profile: CompanyProfile | null): void {
    this.profileForm = this.fb.group({
      displayName: [profile?.displayName || '', [Validators.required]],
      companyName: [profile?.companyName || '', [Validators.required]],
      industry: [profile?.industry || ''],
      companySize: [profile?.companySize || ''],
      website: [profile?.website || ''],
      description: [profile?.description || ''],
      location: [profile?.location || ''],
      foundedYear: [profile?.foundedYear || ''],
      linkedIn: [profile?.linkedIn || ''],
      twitter: [profile?.twitter || ''],
    });

    // Set existing image
    if (profile?.companyLogo) {
      this.profileImageUrl = profile.companyLogo;
    }

    // Start tracking changes with service
    const changesSignal = this.changeDetectionService.startTracking(
      this.TRACKER_ID,
      this.profileForm,
      {
        additionalFields: {
          profileImageUrl: this.profileImageUrl,
        },
      }
    );

    // Update local signal when service signal changes
    this.hasChanges = changesSignal as any;
  }

  // Profile Image Upload
  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Please select an image file', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image size should not exceed 5MB', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
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

        // Update change detection
        this.changeDetectionService.updateField(
          this.TRACKER_ID,
          'profileImageUrl',
          this.profileImageUrl
        );
      },
      error: (error) => {
        console.error('Profile image upload failed:', error);
        this.profileImageUploading = false;
        this.snackBar.open('Failed to upload profile image. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  removeProfileImage(): void {
    this.profileImageFile = null;
    this.profileImagePreview = null;
    this.profileImageUrl = null;
    this.profileImageProgress = 0;

    // Update change detection
    this.changeDetectionService.updateField(this.TRACKER_ID, 'profileImageUrl', null);
  }

  // CV Upload (Job Seekers Only)
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
        this.snackBar.open('Please select a PDF or Word document', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('CV size should not exceed 10MB', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
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

        // Update change detection
        this.changeDetectionService.updateField(this.TRACKER_ID, 'cvUrl', this.cvUrl);
      },
      error: (error) => {
        console.error('CV upload failed:', error);
        this.cvUploading = false;
        this.snackBar.open('Failed to upload CV. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  removeCv(): void {
    this.cvFile = null;
    this.cvFileName = null;
    this.cvUrl = null;
    this.cvProgress = 0;

    // Update change detection
    this.changeDetectionService.updateField(this.TRACKER_ID, 'cvUrl', null);
  }

  // Skills handling
  addSkill(event: any): void {
    const value = event.value.trim();
    if (value && !this.getSkills().includes(value)) {
      const skills = [...this.getSkills(), value];
      this.profileForm.patchValue({ skills: skills.join(', ') });
    }
    event.chipInput.clear();
  }

  removeSkill(skill: string): void {
    const skills = this.getSkills().filter((s) => s !== skill);
    this.profileForm.patchValue({ skills: skills.join(', ') });
  }

  getSkills(): string[] {
    const skillsValue = this.profileForm.get('skills')?.value || '';
    return skillsValue
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  // Submit profile
  async onSubmit(): Promise<void> {
    if (this.profileForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    try {
      const formData = this.profileForm.value;
      const updates: Partial<SeekerProfile | CompanyProfile> = {};

      // Add uploaded file URLs
      if (this.profileImageUrl) {
        if (this.userRole() === 'seeker') {
          (updates as Partial<SeekerProfile>).photoURL = this.profileImageUrl;
        } else {
          (updates as Partial<CompanyProfile>).companyLogo = this.profileImageUrl;
        }
      }

      if (this.cvUrl && this.userRole() === 'seeker') {
        (updates as Partial<SeekerProfile>).resumeURL = this.cvUrl;
      }

      // Add form data with proper type checking
      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        // Skip null, undefined, or empty values
        if (value === null || value === undefined) {
          return;
        }

        // Handle skills array for seekers
        if (key === 'skills' && this.userRole() === 'seeker') {
          (updates as any)[key] = this.getSkills();
          return;
        }

        // Handle string values
        if (typeof value === 'string') {
          const trimmedValue = value.trim();
          if (trimmedValue) {
            (updates as any)[key] = trimmedValue;
          }
          return;
        }

        // Handle number values (like foundedYear)
        if (typeof value === 'number') {
          (updates as any)[key] = value;
          return;
        }

        // Handle any other non-empty values
        if (value) {
          (updates as any)[key] = value;
        }
      });

      console.log('📤 Submitting updates:', updates);

      await this.authService.updateUserProfile(updates);

      // Reset change detection to current state after successful save
      this.changeDetectionService.resetToCurrentState(this.TRACKER_ID, this.profileForm);

      this.snackBar.open('Profile updated successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });

      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('❌ Profile update error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.';

      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get isUploading(): boolean {
    return this.profileImageUploading || this.cvUploading;
  }

  get separatorKeysCodes(): number[] {
    return [13, 188]; // Enter and comma
  }
}
