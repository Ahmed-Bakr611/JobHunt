import { Component, inject, signal, OnInit } from '@angular/core';
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
import { JobService } from '@features/jobs/services/job.services';
import { AuthService } from '@core/services/auth.service';
import { CreateJobData, JobType, ExperienceLevel, Job } from '@shared/models/job.model';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'jb-job-posting',
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
    MatCheckboxModule, // ADD THIS
  ],
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.css'],
})
export class JobPostingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  // Form groups for each step
  basicInfoForm!: FormGroup;
  detailsForm!: FormGroup;
  requirementsForm!: FormGroup;
  reviewForm!: FormGroup;

  // Loading state
  isSubmitting = signal(false);
  currentStep = signal(0);

  // Chip input separator keys
  separatorKeysCodes: number[] = [13, 188]; // Enter and comma

  // Options
  jobTypes: { value: JobType; label: string }[] = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
    { value: 'freelance', label: 'Freelance' },
  ];

  experienceLevels: { value: ExperienceLevel; label: string }[] = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6+ years)' },
    { value: 'lead', label: 'Lead/Principal (8+ years)' },
  ];

  categories = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Marketing',
    'Sales',
    'Design',
    'Engineering',
    'Operations',
    'Human Resources',
  ];

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Check if user is a company
    if (!this.authService.isCompany()) {
      this.router.navigate(['/jobs']);
      return;
    }
  }

  private initializeForms(): void {
    // Step 1: Basic Information
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      companyName: ['', [Validators.required]],
      type: ['full-time', [Validators.required]],
      category: ['', [Validators.required]],
      location: this.fb.group({
        city: ['', [Validators.required]],
        country: ['', [Validators.required]],
        remote: [false],
        hybrid: [false],
      }),
    });

    // Step 2: Job Details
    this.detailsForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(100)]],
      responsibilities: ['', [Validators.required]],
      benefits: [''],
      salary: this.fb.group({
        min: [null, [Validators.min(0)]],
        max: [null, [Validators.min(0)]],
        currency: ['USD', [Validators.required]],
        period: ['yearly', [Validators.required]],
      }),
      numberOfPositions: [1, [Validators.min(1)]],
      experienceLevel: ['', [Validators.required]],
    });

    // Step 3: Requirements
    this.requirementsForm = this.fb.group({
      skills: ['', [Validators.required]],
      requirements: ['', [Validators.required]],
      education: [''],
      experience: [''],
    });

    // Step 4: Review (read-only)
    this.reviewForm = this.fb.group({});
  }

  // Step navigation
  nextStep(): void {
    if (this.currentStep() < 3) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  // Form validation
  isStepValid(step: number): boolean {
    switch (step) {
      case 0:
        return this.basicInfoForm.valid;
      case 1:
        return this.detailsForm.valid;
      case 2:
        return this.requirementsForm.valid;
      case 3:
        return true; // Review step is always valid
      default:
        return false;
    }
  }

  // Skills handling
  addSkill(event: any): void {
    const value = event.value.trim();
    if (value && !this.getSkills().includes(value)) {
      const skills = [...this.getSkills(), value];
      this.requirementsForm.patchValue({ skills: skills.join(', ') });
    }

    event.chipInput.clear();
  }

  removeSkill(skill: string): void {
    const skills = this.getSkills().filter((s) => s !== skill);
    this.requirementsForm.patchValue({ skills: skills.join(', ') });
  }

  getSkills(): string[] {
    const skillsValue = this.requirementsForm.get('skills')?.value || '';
    return skillsValue
      .split(',')
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 0);
  }

  // Submit job
  async onSubmit(): Promise<void> {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);

    try {
      const jobData = this.prepareJobData();
      const response = await this.jobService.create(jobData as Job).toPromise();

      if (response?.success) {
        this.snackBar.open('Job posted successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
        this.router.navigate(['/company/dashboard']);
      } else {
        throw new Error(response?.error || 'Failed to post job');
      }
    } catch (error) {
      this.snackBar.open('Failed to post job. Please try again.', 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar'],
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private prepareJobData(): Partial<Job> {
    const basicInfo = this.basicInfoForm.value;
    const details = this.detailsForm.value;
    const requirements = this.requirementsForm.value;

    // Prepare salary data - only include if values exist
    const salaryData = details.salary;
    const salary =
      salaryData?.min || salaryData?.max
        ? {
            min: salaryData.min || null,
            max: salaryData.max || null,
            currency: salaryData.currency || 'USD',
            period: salaryData.period || 'yearly',
          }
        : null;

    const jobData: any = {
      title: basicInfo.title,
      companyName: basicInfo.companyName,
      type: basicInfo.type,
      category: basicInfo.category,
      location: {
        city: basicInfo.location.city,
        country: basicInfo.location.country,
        remote: basicInfo.location.remote || false,
        hybrid: basicInfo.location.hybrid || false,
      },
      description: details.description,
      responsibilities: details.responsibilities?.split('\n').filter((r: string) => r.trim()) || [],
      benefits: details.benefits?.split('\n').filter((b: string) => b.trim()) || [],
      experienceLevel: details.experienceLevel,
      numberOfPositions: details.numberOfPositions || 1,
      requirements: requirements.requirements?.split('\n').filter((r: string) => r.trim()) || [],
      skills: this.getSkills() || [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Only add salary if it exists
    if (salary) {
      jobData.salary = salary;
    }

    // Add optional fields only if they have values
    if (requirements.education?.trim()) {
      jobData.education = requirements.education.trim();
    }

    if (requirements.experience?.trim()) {
      jobData.experienceRequirements = requirements.experience.trim();
    }

    return jobData;
  }
  // Getter methods for template
  get currentJobData() {
    return this.prepareJobData();
  }

  get salaryRange(): string {
    const salary = this.detailsForm.get('salary')?.value;
    if (!salary || !salary.min || !salary.max) return 'Not specified';
    return `${salary.currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()} / ${
      salary.period
    }`;
  }

  get locationString(): string {
    const location = this.basicInfoForm.get('location')?.value;
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);
    if (location.remote) parts.push('Remote');
    if (location.hybrid) parts.push('Hybrid');
    return parts.join(', ');
  }

  getJobTypeLabel(type: JobType): string {
    const jobType = this.jobTypes.find((t) => t.value === type);
    return jobType?.label || type;
  }

  getExperienceLabel(level: ExperienceLevel): string {
    const expLevel = this.experienceLevels.find((l) => l.value === level);
    return expLevel?.label || level;
  }
}
