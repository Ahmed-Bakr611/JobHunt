// src/app/shared/models/job.model.ts

/**
 * Job type enum
 */
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';

/**
 * Job status enum
 */
export type JobStatus = 'active' | 'closed' | 'draft';

/**
 * Experience level enum
 */
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

/**
 * Salary information
 */
export interface Salary {
  min: number;
  max: number;
  currency: string; // USD, EUR, EGP, etc.
  period?: 'hourly' | 'monthly' | 'yearly';
}

/**
 * Job location information
 */
export interface JobLocation {
  city?: string;
  country?: string;
  remote?: boolean;
  hybrid?: boolean;
}

/**
 * Job interface
 */
export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;

  title: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];

  location: JobLocation;
  salary?: Salary;
  type: JobType;
  category: string; // IT, Marketing, Sales, etc.
  experienceLevel?: ExperienceLevel;

  skills: string[];
  numberOfPositions?: number;

  status: JobStatus;

  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;

  viewCount?: number;
  applicationCount?: number;
}

/**
 * Job creation data (subset of Job without generated fields)
 */
export interface CreateJobData {
  title: string;
  description: string;
  requirements: string[];
  responsibilities?: string[];
  benefits?: string[];
  location: JobLocation;
  salary?: Salary;
  type: JobType;
  category: string;
  experienceLevel?: ExperienceLevel;
  skills: string[];
  numberOfPositions?: number;
  expiresAt?: Date;
}

/**
 * Job update data (partial Job)
 */
export type UpdateJobData = Partial<CreateJobData> & {
  status?: JobStatus;
};

/**
 * Job filter criteria
 */
export interface JobFilter {
  searchQuery?: string;
  type?: JobType[];
  category?: string[];
  experienceLevel?: ExperienceLevel[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  companyId?: string;
}

/**
 * Job statistics for company dashboard
 */
export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  totalViews: number;
}
