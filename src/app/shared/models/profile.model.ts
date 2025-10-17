// src/app/shared/models/profile.model.ts

/**
 * Base profile interface with common fields
 */
export interface BaseProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Job Seeker Profile - extends base with seeker-specific fields
 */
export interface SeekerProfile extends BaseProfile {
  phone?: string;
  location?: string;
  bio?: string;
  skills?: string[]; // Array of skills
  experience?: string;
  education?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  resume?: string; // URL to resume file
}

/**
 * Company Profile - extends base with company-specific fields
 */
export interface CompanyProfile extends BaseProfile {
  companyName: string;
  industry?: string;
  companySize?: string; // '1-10', '11-50', etc.
  website?: string;
  description?: string;
  location?: string;
  foundedYear?: number;
  linkedIn?: string;
  twitter?: string;
  logo?: string; // URL to company logo
}
