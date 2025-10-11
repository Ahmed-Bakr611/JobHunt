// src/app/shared/models/user.model.ts

/**
 * User role types
 */
export type UserRole = 'seeker' | 'company';

/**
 * Base user interface
 */
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Job Seeker Profile
 * Extended user interface for job seekers
 */
export interface SeekerProfile extends User {
  role: 'seeker';
  phone?: string;
  resumeURL?: string;
  skills: string[];
  experience?: string;
  education?: string;
  location?: string;
  bio?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

/**
 * Company Profile
 * Extended user interface for companies
 */
export interface CompanyProfile extends User {
  role: 'company';
  companyName: string;
  companyLogo?: string;
  industry?: string;
  companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1000+';
  website?: string;
  description?: string;
  location?: string;
  foundedYear?: number;
  linkedIn?: string;
  twitter?: string;
}

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
}

/**
 * User login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Type guard to check if user is a seeker
 */
export function isSeekerProfile(user: User): user is SeekerProfile {
  return user.role === 'seeker';
}

/**
 * Type guard to check if user is a company
 */
export function isCompanyProfile(user: User): user is CompanyProfile {
  return user.role === 'company';
}
