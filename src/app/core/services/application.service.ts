import { Injectable, signal, computed, inject } from '@angular/core';
import { FirestoreCrudService } from '@fb/firestorecrud.service';
import { AuthService } from './auth.service';
import { COLLECTIONS } from '@fb/const';
import { firstValueFrom } from 'rxjs';

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  companyId: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  resumeURL?: string;
  coverLetter?: string;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string; // Company notes
}

export type ApplicationStatus = 'pending' | 'reviewing' | 'accepted' | 'rejected';

export interface CreateApplicationData {
  jobId: string;
  companyId: string;
  jobTitle: string;
  companyName: string;
  resumeURL?: string;
  coverLetter?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private crudService = inject(FirestoreCrudService);
  private authService = inject(AuthService);

  // Private signals for state management
  private applicationsSignal = signal<Application[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly applications = this.applicationsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly myApplications = computed(() => {
    const userId = this.authService.userId();
    if (!userId) return [];
    return this.applications().filter((app) => app.seekerId === userId);
  });

  readonly pendingApplications = computed(() => {
    return this.myApplications().filter((app) => app.status === 'pending');
  });

  readonly reviewingApplications = computed(() => {
    return this.myApplications().filter((app) => app.status === 'reviewing');
  });

  readonly acceptedApplications = computed(() => {
    return this.myApplications().filter((app) => app.status === 'accepted');
  });

  readonly rejectedApplications = computed(() => {
    return this.myApplications().filter((app) => app.status === 'rejected');
  });

  /**
   * Apply to a job
   */
  async applyToJob(applicationData: CreateApplicationData): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const userId = this.authService.userId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const timestamp = new Date().toISOString();
      const application: Omit<Application, 'id'> = {
        jobId: applicationData.jobId,
        seekerId: userId,
        companyId: applicationData.companyId,
        jobTitle: applicationData.jobTitle,
        companyName: applicationData.companyName,
        status: 'pending',
        resumeURL: applicationData.resumeURL,
        coverLetter: applicationData.coverLetter,
        appliedAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      const response = await firstValueFrom(
        this.crudService.create<Omit<Application, 'id'>>(COLLECTIONS.Applications, application)
      );

      if (response.success) {
        console.log('✅ Application submitted successfully');
        // Refresh applications
        await this.loadMyApplications();
      } else {
        throw new Error(response.error || 'Failed to submit application');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Failed to submit application');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load applications for the current user
   */
  async loadMyApplications(): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const userId = this.authService.userId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await firstValueFrom(this.crudService.getAll(COLLECTIONS.Applications));

      if (response.success && Array.isArray(response.data)) {
        const userApplications = response.data.filter((app) => app.seekerId === userId);
        this.applicationsSignal.set(userApplications);
        console.log('✅ Applications loaded:', userApplications.length);
      } else {
        throw new Error(response.error || 'Failed to load applications');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Failed to load applications');
      this.errorSignal.set(message);
      console.error('Error loading applications:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load applications for a specific job (company view)
   */
  async loadJobApplications(jobId: string): Promise<Application[]> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const response = await firstValueFrom(this.crudService.getAll(COLLECTIONS.Applications));

      if (response.success && Array.isArray(response.data)) {
        const jobApplications = response.data.filter((app) => app.jobId === jobId);
        console.log('✅ Job applications loaded:', jobApplications.length);
        return jobApplications;
      } else {
        throw new Error(response.error || 'Failed to load job applications');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Failed to load job applications');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update application status (company action)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const updates: Partial<Application> = {
        status,
        updatedAt: new Date(),
        ...(notes && { notes }),
      };

      const response = await firstValueFrom(
        this.crudService.update<Application>(COLLECTIONS.Applications, applicationId, updates)
      );

      if (response.success) {
        console.log('✅ Application status updated');
        // Refresh applications
        await this.loadMyApplications();
      } else {
        throw new Error(response.error || 'Failed to update application status');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Failed to update application status');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Check if user has already applied to a job
   */
  hasAppliedToJob(jobId: string): boolean {
    const userId = this.authService.userId();
    if (!userId) return false;
    return this.myApplications().some((app) => app.jobId === jobId);
  }

  /**
   * Get application for a specific job
   */
  getApplicationForJob(jobId: string): Application | null {
    const userId = this.authService.userId();
    if (!userId) return null;
    return this.myApplications().find((app) => app.jobId === jobId) || null;
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  private getErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return defaultMessage;
  }
}
