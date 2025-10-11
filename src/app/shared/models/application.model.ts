// src/app/shared/models/application.model.ts

/**
 * Application status enum
 */
export type ApplicationStatus =
  | 'pending'
  | 'reviewing'
  | 'shortlisted'
  | 'interviewed'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

/**
 * Application interface
 */
export interface Application {
  id: string;

  // References
  jobId: string;
  seekerId: string;
  companyId: string;

  // Job seeker information (denormalized for quick access)
  seekerName: string;
  seekerEmail: string;
  seekerPhone?: string;
  seekerPhotoURL?: string;

  // Job information (denormalized for quick access)
  jobTitle: string;
  companyName: string;

  // Application data
  resumeURL: string;
  coverLetter?: string;
  status: ApplicationStatus;

  // Additional information
  answers?: Record<string, string>; // Custom questions from job posting
  notes?: string; // Company's internal notes

  // Timestamps
  appliedAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  respondedAt?: Date;
}

/**
 * Application creation data
 */
export interface CreateApplicationData {
  jobId: string;
  resumeURL: string;
  coverLetter?: string;
  answers?: Record<string, string>;
}

/**
 * Application update data
 */
export interface UpdateApplicationData {
  status?: ApplicationStatus;
  notes?: string;
  reviewedAt?: Date;
  respondedAt?: Date;
}

/**
 * Application with full job and seeker details
 */
export interface ApplicationWithDetails extends Application {
  job?: {
    id: string;
    title: string;
    description: string;
    type: string;
    location: any;
    salary?: any;
    status: string;
  };
  seeker?: {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
    skills?: string[];
    experience?: string;
    linkedIn?: string;
  };
}

/**
 * Application filter criteria
 */
export interface ApplicationFilter {
  status?: ApplicationStatus[];
  jobId?: string;
  seekerId?: string;
  companyId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

/**
 * Application statistics
 */
export interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  interviewed: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

/**
 * Application status history entry
 */
export interface ApplicationStatusHistory {
  status: ApplicationStatus;
  timestamp: Date;
  updatedBy: string; // user id who made the change
  notes?: string;
}

/**
 * Extended application with status history
 */
export interface ApplicationWithHistory extends Application {
  statusHistory: ApplicationStatusHistory[];
}

/**
 * Type guard to check if application is pending
 */
export function isPendingApplication(app: Application): boolean {
  return app.status === 'pending';
}

/**
 * Type guard to check if application is in progress
 */
export function isActiveApplication(app: Application): boolean {
  return ['reviewing', 'shortlisted', 'interviewed'].includes(app.status);
}

/**
 * Type guard to check if application is completed
 */
export function isCompletedApplication(app: Application): boolean {
  return ['accepted', 'rejected', 'withdrawn'].includes(app.status);
}

/**
 * Get application status color for UI
 */
export function getApplicationStatusColor(status: ApplicationStatus): string {
  const colors: Record<ApplicationStatus, string> = {
    pending: 'warn',
    reviewing: 'accent',
    shortlisted: 'primary',
    interviewed: 'primary',
    accepted: 'success',
    rejected: 'error',
    withdrawn: 'disabled',
  };
  return colors[status] || 'default';
}

/**
 * Get application status label
 */
export function getApplicationStatusLabel(status: ApplicationStatus): string {
  const labels: Record<ApplicationStatus, string> = {
    pending: 'Pending Review',
    reviewing: 'Under Review',
    shortlisted: 'Shortlisted',
    interviewed: 'Interviewed',
    accepted: 'Accepted',
    rejected: 'Rejected',
    withdrawn: 'Withdrawn',
  };
  return labels[status] || status;
}
