// src/app/core/services/profile.service.ts
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { doc, getDoc, setDoc, updateDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { SeekerProfile, CompanyProfile } from '@shared/models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private db = inject(Firestore);
  private authService = inject(AuthService);

  // Private signals for state management
  private seekerProfileSignal = signal<SeekerProfile | null>(null);
  private companyProfileSignal = signal<CompanyProfile | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly seekerProfile = this.seekerProfileSignal.asReadonly();
  readonly companyProfile = this.companyProfileSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals
  readonly hasProfile = computed(() => {
    const role = this.authService.userRole();
    if (role === 'seeker') {
      return this.seekerProfile() !== null;
    } else if (role === 'company') {
      return this.companyProfile() !== null;
    }
    return false;
  });

  readonly isProfileComplete = computed(() => {
    const role = this.authService.userRole();
    if (role === 'seeker') {
      const profile = this.seekerProfile();
      return profile !== null && !!profile.displayName;
    } else if (role === 'company') {
      const profile = this.companyProfile();
      return profile !== null && !!profile.companyName && !!profile.displayName;
    }
    return false;
  });

  constructor() {
    // Auto-load profile when user changes (using effect for Signal)
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadProfile(user.uid, user.role);
      } else {
        this.clearProfiles();
      }
    });
  }

  /**
   * Load user profile based on role
   */
  async loadProfile(uid: string, role: 'seeker' | 'company'): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      if (role === 'seeker') {
        await this.loadSeekerProfile(uid);
      } else if (role === 'company') {
        await this.loadCompanyProfile(uid);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      this.errorSignal.set('Failed to load profile');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Load seeker profile from Firestore
   */
  private async loadSeekerProfile(uid: string): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(this.db, 'users', uid));

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const profile: SeekerProfile = {
          uid,
          displayName: data['displayName'] || '',
          email: data['email'] || '',
          phone: data['phone'],
          location: data['location'],
          bio: data['bio'],
          skills: data['skills'] || [],
          experience: data['experience'],
          education: data['education'],
          linkedIn: data['linkedIn'],
          github: data['github'],
          portfolio: data['portfolio'],
          photoURL: data['photoURL'],
          resume: data['resume'],
          createdAt: data['createdAt'],
          updatedAt: data['updatedAt'],
        };
        this.seekerProfileSignal.set(profile);
        console.log('✅ Seeker profile loaded successfully');
      } else {
        console.log('ℹ️ No seeker profile found for uid:', uid);
        this.seekerProfileSignal.set(null);
      }
    } catch (error) {
      console.error('❌ Error loading seeker profile:', error);
      throw error;
    }
  }

  /**
   * Load company profile from Firestore
   */
  private async loadCompanyProfile(uid: string): Promise<void> {
    try {
      const profileDoc = await getDoc(doc(this.db, 'users', uid));

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        const profile: CompanyProfile = {
          uid,
          displayName: data['displayName'] || '',
          email: data['email'] || '',
          companyName: data['companyName'] || '',
          industry: data['industry'],
          companySize: data['companySize'],
          website: data['website'],
          description: data['description'],
          location: data['location'],
          foundedYear: data['foundedYear'],
          linkedIn: data['linkedIn'],
          twitter: data['twitter'],
          logo: data['logo'],
          createdAt: data['createdAt'],
          updatedAt: data['updatedAt'],
        };
        this.companyProfileSignal.set(profile);
        console.log('✅ Company profile loaded successfully');
      } else {
        console.log('ℹ️ No company profile found for uid:', uid);
        this.companyProfileSignal.set(null);
      }
    } catch (error) {
      console.error('❌ Error loading company profile:', error);
      throw error;
    }
  }

  /**
   * Create or update seeker profile
   */
  async updateSeekerProfile(uid: string, profileData: Partial<SeekerProfile>): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const profileRef = doc(this.db, 'seekerProfiles', uid);
      const profileDoc = await getDoc(profileRef);

      const timestamp = new Date().toISOString();
      const data = {
        ...profileData,
        uid,
        updatedAt: timestamp,
      };

      if (profileDoc.exists()) {
        // Update existing profile
        await updateDoc(profileRef, data);
        console.log('✅ Seeker profile updated');
      } else {
        // Create new profile
        await setDoc(profileRef, {
          ...data,
          createdAt: timestamp,
        });
        console.log('✅ Seeker profile created');
      }

      // Reload profile
      await this.loadSeekerProfile(uid);
    } catch (error) {
      console.error('❌ Error updating seeker profile:', error);
      this.errorSignal.set('Failed to update profile');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Create or update company profile
   */
  async updateCompanyProfile(uid: string, profileData: Partial<CompanyProfile>): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const profileRef = doc(this.db, 'companyProfiles', uid);
      const profileDoc = await getDoc(profileRef);

      const timestamp = new Date().toISOString();
      const data = {
        ...profileData,
        uid,
        updatedAt: timestamp,
      };

      if (profileDoc.exists()) {
        // Update existing profile
        await updateDoc(profileRef, data);
        console.log('✅ Company profile updated');
      } else {
        // Create new profile
        await setDoc(profileRef, {
          ...data,
          createdAt: timestamp,
        });
        console.log('✅ Company profile created');
      }

      // Reload profile
      await this.loadCompanyProfile(uid);
    } catch (error) {
      console.error('❌ Error updating company profile:', error);
      this.errorSignal.set('Failed to update profile');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Clear all profiles
   */
  private clearProfiles(): void {
    this.seekerProfileSignal.set(null);
    this.companyProfileSignal.set(null);
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
}
