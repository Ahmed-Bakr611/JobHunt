// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Auth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { User, UserRole, SeekerProfile, CompanyProfile } from '@shared/models/user.model';
import { FirestoreCrudService } from '@fb/firestorecrud.service';
import { COLLECTIONS } from '@fb/const';
import { firstValueFrom } from 'rxjs';

// Basic user info stored in users collection
interface UserInfo {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private crudService = inject(FirestoreCrudService);
  private router = inject(Router);

  // Private signals for state management
  private currentUserSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(true);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  // Computed signals for derived state
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isSeeker = computed(() => this.userRole() === 'seeker');
  readonly isCompany = computed(() => this.userRole() === 'company');
  readonly userId = computed(() => this.currentUser()?.uid ?? null);
  seekerProfile = computed<SeekerProfile | null>(() =>
    this.isSeeker() ? (this.currentUser() as SeekerProfile) : null
  );

  companyProfile = computed<CompanyProfile | null>(() =>
    this.isCompany() ? (this.currentUser() as CompanyProfile) : null
  );
  constructor() {
    this.initAuthListener();
    this.checkRedirectResult().catch((err) => {
      console.error('Error checking redirect result:', err);
    });
    console.log(this.currentUser());
    console.log(this.isAuthenticated());
  }

  /**
   * Initialize Firebase auth state listener
   */
  /**
   * Initialize Firebase auth state listener
   */
  private initAuthListener(): void {
    this.loadingSignal.set(true);

    onAuthStateChanged(this.auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? firebaseUser.uid : 'No user');

      if (firebaseUser) {
        console.log('✅ User is signed in, loading profile...');
        try {
          await this.loadUserProfile(firebaseUser.uid);
        } catch (error) {
          console.error('❌ Failed to load profile:', error);
          this.currentUserSignal.set(null);
          this.errorSignal.set('Failed to load user profile');
        }
      } else {
        console.log('❌ No user signed in');
        this.currentUserSignal.set(null);
      }

      this.loadingSignal.set(false);
    });
  }

  // /**
  //  * Load user profile from Firestore based on role
  //  */
  // private async loadUserProfile(uid: string): Promise<void> {
  //   try {
  //     console.log('🔍 Loading user info for uid:', uid);

  //     // First, get the basic user info (role) from users collection
  //     const userInfoResponse = await firstValueFrom(
  //       this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
  //     );

  //     if (!userInfoResponse.success) {
  //       console.error('❌ Failed to get user info:', userInfoResponse.error);
  //       this.currentUserSignal.set(null);
  //       return;
  //     }

  //     if (!userInfoResponse.data) {
  //       console.warn('⚠️ User info does not exist for uid:', uid);
  //       this.currentUserSignal.set(null);
  //       return;
  //     }

  //     const userInfo = userInfoResponse.data as UserInfo;
  //     console.log('✅ User info loaded, role:', userInfo.role);

  //     // Now load the full profile from the role-specific collection
  //     const profileCollection = this.getCollectionNameByRole(userInfo.role);
  //     console.log('🔍 Loading full profile from:', profileCollection);

  //     const profileResponse = await firstValueFrom(
  //       this.crudService.getById<SeekerProfile | CompanyProfile>(profileCollection, uid)
  //     );

  //     if (!profileResponse.success) {
  //       console.error('❌ Failed to get profile:', profileResponse.error);
  //       this.currentUserSignal.set(null);
  //       return;
  //     }

  //     if (!profileResponse.data) {
  //       console.warn('⚠️ User profile does not exist in', profileCollection);
  //       this.currentUserSignal.set(null);
  //       return;
  //     }

  //     this.currentUserSignal.set(profileResponse.data as User);
  //     console.log('✅ User profile loaded successfully:', (profileResponse.data as User).email);
  //   } catch (error) {
  //     console.error('❌ Error loading user profile:', error);
  //     this.errorSignal.set('Failed to load user profile');
  //     this.currentUserSignal.set(null);
  //   }
  // }

  /**
   * Get collection name based on user role
   */
  private getCollectionNameByRole(role: UserRole): string {
    return role === 'seeker' ? COLLECTIONS.SeekerProfile : COLLECTIONS.CompanyProfile;
  }

  /**
  //  * Load user profile from Firestore based on role
  //  * First load from users collection to get role, then fetch from specific collection
  //  */
  // private async loadUserProfile(uid: string): Promise<void> {
  //   try {
  //     console.log('🔍 Loading user info for uid:', uid);

  //     // First, get the basic user info (role) from users collection
  //     const userInfoResponse = await firstValueFrom(
  //       this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
  //     );

  //     if (userInfoResponse.success && userInfoResponse.data) {
  //       const userInfo = userInfoResponse.data as UserInfo;
  //       console.log('✅ User info loaded, role:', userInfo.role);

  //       // Now load the full profile from the role-specific collection
  //       const profileCollection = this.getCollectionNameByRole(userInfo.role);
  //       console.log('🔍 Loading full profile from:', profileCollection);

  //       const profileResponse = await firstValueFrom(
  //         this.crudService.getById<SeekerProfile | CompanyProfile>(profileCollection, uid)
  //       );

  //       if (profileResponse.success && profileResponse.data) {
  //         this.currentUserSignal.set(profileResponse.data as User);
  //         console.log('✅ User profile loaded successfully:', (profileResponse.data as User).email);
  //       } else {
  //         console.warn('⚠️ User profile does not exist in', profileCollection);
  //         this.currentUserSignal.set(null);
  //       }
  //     } else {
  //       console.warn('⚠️ User info does not exist for uid:', uid);
  //       this.currentUserSignal.set(null);
  //     }
  //   } catch (error) {
  //     console.error('❌ Error loading user profile:', error);
  //     this.errorSignal.set('Failed to load user profile');
  //     this.currentUserSignal.set(null);
  //   }
  // }
  /**
   * Load user profile from Firestore based on role
   */
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      console.log('🔍 Loading user info for uid:', uid);

      const userInfoResponse = await firstValueFrom(
        this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
      );

      if (!userInfoResponse.success) {
        console.warn('⚠️ Failed to get user info:', userInfoResponse.error);
        this.currentUserSignal.set(null);
        return;
      }

      if (!userInfoResponse.data) {
        console.warn('⚠️ User info does not exist for uid:', uid);
        this.currentUserSignal.set(null);
        return;
      }

      const userInfo = userInfoResponse.data as UserInfo;
      console.log('✅ User info loaded, role:', userInfo.role);

      // Load the full profile from the role-specific collection
      const profileCollection = this.getCollectionNameByRole(userInfo.role);
      console.log('🔍 Loading full profile from:', profileCollection);

      const profileResponse = await firstValueFrom(
        this.crudService.getById<SeekerProfile | CompanyProfile>(profileCollection, uid)
      );

      if (!profileResponse.success) {
        console.warn('⚠️ Failed to get profile:', profileResponse.error);
        this.currentUserSignal.set(null);
        return;
      }

      if (!profileResponse.data) {
        console.warn('⚠️ User profile does not exist in', profileCollection);
        this.currentUserSignal.set(null);
        return;
      }

      this.currentUserSignal.set(profileResponse.data as User);
      console.log('✅ User profile loaded successfully:', (profileResponse.data as User).email);
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      this.errorSignal.set('Failed to load user profile');
      this.currentUserSignal.set(null);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole,
    additionalData?: Partial<SeekerProfile | CompanyProfile>
  ): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      console.debug({ email, password, displayName, role });

      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);

      console.debug(userCredential);
      // Update display name
      await updateProfile(userCredential.user, { displayName });

      const uid = userCredential.user.uid;
      const timestamp = new Date().toISOString();

      // 1. Create basic user info in users collection
      const userInfo: UserInfo = {
        uid,
        email,
        displayName,
        role,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      console.log('📝 Creating user info in users collection');
      const userInfoResponse = await firstValueFrom(
        this.crudService.create<UserInfo>(COLLECTIONS.Users, userInfo)
      );

      if (userInfoResponse.success) {
        console.log('✅ User info created in users collection');

        // 2. Create detailed profile in role-specific collection
        const profileCollection = this.getCollectionNameByRole(role);
        const baseUser = {
          uid,
          email,
          displayName,
          role,
          createdAt: timestamp,
          updatedAt: timestamp,
        };

        const userData =
          role === 'seeker'
            ? ({ ...baseUser, skills: [], ...additionalData } as SeekerProfile)
            : ({ ...baseUser, companyName: '', ...additionalData } as CompanyProfile);

        console.log('📝 Creating profile in', profileCollection);
        const profileResponse = await firstValueFrom(
          this.crudService.create<SeekerProfile | CompanyProfile>(profileCollection, userData)
        );

        if (profileResponse.success) {
          console.log('✅ User profile created in', profileCollection);
          this.currentUserSignal.set(userData as User);
          this.navigateByRole(role);
        } else {
          console.error('❌ Error creating user profile:', profileResponse.error);
          this.errorSignal.set('Failed to create user profile');
        }
      } else {
        console.error('❌ Error creating user info:', userInfoResponse.error);
        this.errorSignal.set('Failed to create user information');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Sign up failed');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

      console.log('✅ Sign-in successful, getting user role...');

      // Get the role from Firestore
      const userInfoResponse = await firstValueFrom(
        this.crudService.getById<UserInfo>(COLLECTIONS.Users, userCredential.user.uid)
      );
      console.log(userCredential);
      console.log(userInfoResponse);
      if (
        userInfoResponse.success &&
        userInfoResponse.data &&
        !Array.isArray(userInfoResponse.data)
      ) {
        const role = userInfoResponse.data.role;
        console.log('✅ User role found:', role);
        // Handle the authenticated user with the correct role
        await this.handleAuthenticatedUser(userCredential.user, role);
        console.log('✅ Sign-in successful, loading profile...');
      } else {
        throw new Error('User information not found');
      }
      // Handle the authenticated user (same as Google sign-in)
      // await this.handleAuthenticatedUser(userCredential.user, 'seeker');
      // await signInWithEmailAndPassword(this.auth, email, password);

      // User will be loaded by auth listener
      // await this.waitForUser(5000);

      // Navigate based on role
      // const role = this.userRole();
      // console.log(role);
      // if (role) {
      //   this.navigateByRole(role);
      // }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Sign in failed');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign in with Google - Using popup
   */
  async signInWithGoogle(role: UserRole): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      console.log('🔄 Starting Google sign-in with popup...');

      try {
        // Use popup method
        const userCredential = await signInWithPopup(this.auth, provider);
        console.log('✅ Google sign-in popup success:', userCredential.user);

        // Handle the authenticated user immediately
        await this.handleAuthenticatedUser(userCredential.user, role);
      } catch (popupError: any) {
        console.error('❌ Popup sign-in failed:', popupError);

        // If popup was blocked, fallback to redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log('⚠️ Popup blocked or closed, using redirect method...');
          sessionStorage.setItem('pendingRole', role);
          await signInWithRedirect(this.auth, provider);
          return; // Exit, redirect will handle the rest
        }

        throw popupError;
      }
    } catch (error: unknown) {
      console.error('🔥 Error in signInWithGoogle:', error);
      const message = this.getErrorMessage(error, 'Google sign in failed');
      this.errorSignal.set(message);
      this.loadingSignal.set(false);
      throw error;
    }
  }

  /**
   * Sign in with Google for role selection (new users)
   */
  async signInWithGoogleForRoleSelection(): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
      });

      console.log('🔄 Starting Google sign-in for role selection...');

      try {
        // Use popup method
        const userCredential = await signInWithPopup(this.auth, provider);
        console.log('✅ Google sign-in popup success:', userCredential.user);

        // Check if user exists
        const uid = userCredential.user.uid;
        const userInfoResponse = await firstValueFrom(
          this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
        );

        if (userInfoResponse.success && userInfoResponse.data) {
          // Existing user - load their profile
          console.log('📂 Existing user found, loading profile...');
          if (userInfoResponse.data && !Array.isArray(userInfoResponse.data)) {
            const userInfo = userInfoResponse.data as UserInfo;
            await this.handleAuthenticatedUser(userCredential.user, userInfo.role);
          } else {
            throw new Error('User information not found');
          }
        } else {
          // New user - redirect to role selection
          console.log('🆕 New user detected, redirecting to role selection...');
          this.router.navigate(['/auth/role-selection']);
        }
      } catch (popupError: any) {
        console.error('❌ Popup sign-in failed:', popupError);

        // If popup was blocked, fallback to redirect
        if (
          popupError.code === 'auth/popup-blocked' ||
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.code === 'auth/cancelled-popup-request'
        ) {
          console.log('⚠️ Popup blocked or closed, using redirect method...');
          sessionStorage.setItem('pendingRoleSelection', 'true');
          await signInWithRedirect(this.auth, provider);
          return; // Exit, redirect will handle the rest
        }

        throw popupError;
      }
    } catch (error: unknown) {
      console.error('🔥 Error in signInWithGoogleForRoleSelection:', error);
      const message = this.getErrorMessage(error, 'Google sign in failed');
      this.errorSignal.set(message);
      this.loadingSignal.set(false);
      throw error;
    }
  }

  /**
   * Complete Google sign-in for new users (after role selection)
   */
  async completeGoogleSignIn(role: UserRole): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      console.log('🔄 Completing Google sign-in for new user...');
      await this.handleAuthenticatedUser(currentUser, role);
    } catch (error: unknown) {
      console.error('🔥 Error completing Google sign-in:', error);
      const message = this.getErrorMessage(error, 'Failed to complete registration');
      this.errorSignal.set(message);
      this.loadingSignal.set(false);
      throw error;
    }
  }

  /**
   * Check for redirect result after user returns from Google
   */
  private async checkRedirectResult(): Promise<void> {
    try {
      console.log('🔍 Checking for redirect result...');
      const result = await getRedirectResult(this.auth);

      if (!result) {
        // This is normal - it means we're not returning from a redirect
        console.log('ℹ️ No redirect result (not returning from Google sign-in)');
        return;
      }

      console.log('✅ Google sign-in redirect success:', result.user);
      this.loadingSignal.set(true);

      // Check if this is for role selection
      const isRoleSelection = sessionStorage.getItem('pendingRoleSelection');
      if (isRoleSelection) {
        sessionStorage.removeItem('pendingRoleSelection');
        // Check if user exists
        const uid = result.user.uid;
        const userInfoResponse = await firstValueFrom(
          this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
        );

        if (userInfoResponse.success && userInfoResponse.data) {
          // Existing user - load their profile
          console.log('📂 Existing user found, loading profile...');
          if (userInfoResponse.data && !Array.isArray(userInfoResponse.data)) {
            const userInfo = userInfoResponse.data as UserInfo;
            await this.handleAuthenticatedUser(result.user, userInfo.role);
          } else {
            throw new Error('User information not found');
          }
        } else {
          // New user - redirect to role selection
          console.log('🆕 New user detected, redirecting to role selection...');
          this.router.navigate(['/auth/role-selection']);
        }
      } else {
        // Legacy flow with stored role
        const role = (sessionStorage.getItem('pendingRole') as UserRole) || 'seeker';
        sessionStorage.removeItem('pendingRole');
        await this.handleAuthenticatedUser(result.user, role);
      }
    } catch (error: unknown) {
      console.error('🔥 Error handling redirect result:', error);
      const message = this.getErrorMessage(error, 'Authentication failed');
      this.errorSignal.set(message);
      sessionStorage.removeItem('pendingRole');
      sessionStorage.removeItem('pendingRoleSelection');
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Handle authenticated user after Google sign-in
   * First check users collection, then create if needed
   */
  private async handleAuthenticatedUser(firebaseUser: any, role: UserRole): Promise<void> {
    try {
      console.log('🔧 Handling authenticated user:', firebaseUser.uid);

      const uid = firebaseUser.uid;
      const timestamp = new Date().toISOString();

      // Check if user exists in users collection
      const userInfoResponse = await firstValueFrom(
        this.crudService.getById<UserInfo>(COLLECTIONS.Users, uid)
      );

      console.log(userInfoResponse);
      if (userInfoResponse.success && userInfoResponse.data) {
        // User exists, load their full profile
        console.log('📂 User exists in users collection');
        const userInfo = userInfoResponse.data as UserInfo;
        const profileCollection = this.getCollectionNameByRole(userInfo.role);
        console.log(userInfo);
        console.log(profileCollection);
        console.log(uid);

        const profileResponse = await firstValueFrom(
          this.crudService.getById<SeekerProfile | CompanyProfile>(profileCollection, uid)
        );

        if (profileResponse.success && profileResponse.data) {
          this.currentUserSignal.set(profileResponse.data as User);
          console.log('✅ Existing user profile loaded from Firestore');
          this.navigateByRole(userInfo.role);
        } else throw new Error('Ussr Not Exist');
      }
      // } else {
      //   // New user - create in both collections
      //   console.log('📝 Creating new user in users and profile collections');

      //   // 1. Create user info in users collection
      //   const userInfo: UserInfo = {
      //     uid,
      //     email: firebaseUser.email!,
      //     displayName: firebaseUser.displayName || 'User',
      //     role,
      //     createdAt: timestamp,
      //     updatedAt: timestamp,
      //   };

      //   const userInfoCreateResponse = await firstValueFrom(
      //     this.crudService.create<UserInfo>(COLLECTIONS.Users, userInfo)
      //   );

      //   if (userInfoCreateResponse.success) {
      //     console.log('✅ User info created in users collection');

      //     // 2. Create profile in role-specific collection
      //     const profileCollection = this.getCollectionNameByRole(role);
      //     const baseUser = {
      //       uid,
      //       email: firebaseUser.email!,
      //       displayName: firebaseUser.displayName || 'User',
      //       role,
      //       createdAt: timestamp,
      //       updatedAt: timestamp,
      //     };

      //     const userData =
      //       role === 'seeker'
      //         ? ({
      //             ...baseUser,
      //             photoURL: firebaseUser.photoURL || undefined,
      //             skills: [],
      //           } as SeekerProfile)
      //         : ({
      //             ...baseUser,
      //             companyLogo: firebaseUser.photoURL || undefined,
      //             companyName: '',
      //           } as CompanyProfile);

      //     const profileCreateResponse = await firstValueFrom(
      //       this.crudService.create<SeekerProfile | CompanyProfile>(profileCollection, userData)
      //     );

      //     if (profileCreateResponse.success) {
      //       console.log('✅ User profile created in', profileCollection);
      //       this.currentUserSignal.set(userData as User);
      //       this.navigateByRole(role);
      //     } else {
      //       console.error('❌ Error creating user profile:', profileCreateResponse.error);
      //     }
      //   } else {
      //     console.error('❌ Error creating user info:', userInfoCreateResponse.error);
      //   }
      // }
    } catch (error) {
      console.error('❌ Error handling authenticated user:', error);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign out current user
   */
  async signOutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSignal.set(null);
      this.router.navigate(['/auth/login']);
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Sign out failed');
      this.errorSignal.set(message);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      await sendPasswordResetEmail(this.auth, email);
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Password reset failed');
      this.errorSignal.set(message);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update user profile
   * Updates both users collection and role-specific profile collection
   */
  async updateUserProfile(updates: Partial<SeekerProfile | CompanyProfile>): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const timestamp = new Date().toISOString();
      const profileCollection = this.getCollectionNameByRole(user.role);

      // Update users collection
      const userUpdateResponse = await firstValueFrom(
        this.crudService.update<UserInfo>(COLLECTIONS.Users, user.uid, {
          updatedAt: timestamp,
        } as Partial<UserInfo>)
      );

      if (userUpdateResponse.success) {
        console.log('✅ User info updated in users collection');

        // Update role-specific collection
        const profileUpdateResponse = await firstValueFrom(
          this.crudService.update<SeekerProfile | CompanyProfile>(profileCollection, user.uid, {
            ...updates,
            updatedAt: timestamp,
          } as Partial<SeekerProfile | CompanyProfile>)
        );

        if (profileUpdateResponse.success) {
          console.log('✅ User profile updated in', profileCollection);
          // Update local state
          this.currentUserSignal.set({
            ...user,
            ...updates,
            updatedAt: timestamp,
          });
        } else {
          console.error('❌ Error updating user profile:', profileUpdateResponse.error);
          this.errorSignal.set('Profile update failed');
        }
      } else {
        console.error('❌ Error updating user info:', userUpdateResponse.error);
        this.errorSignal.set('Failed to update user information');
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Profile update failed');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSignal.set(null);
  }

  /**
   * Navigate based on user role
   */
  private navigateByRole(role: UserRole): void {
    if (role === 'company') {
      this.router.navigate(['/company/dashboard']);
    } else {
      this.router.navigate(['/jobs']);
    }
  }

  /**
   * Wait for user to be loaded (used after sign in)
   */
  private waitForUser(): Promise<void> {
    return new Promise((resolve) => {
      const checkUser = () => {
        if (this.currentUser() !== null) {
          resolve();
        } else {
          setTimeout(checkUser, 100);
        }
      };
      checkUser();
    });
  }

  /**
   * Extract error message from Firebase error
   */
  private getErrorMessage(error: unknown, defaultMessage: string): string {
    if (error instanceof Error) {
      const errorCode = (error as any).code;

      switch (errorCode) {
        case 'auth/email-already-in-use':
          return 'This email is already registered';
        case 'auth/invalid-email':
          return 'Invalid email address';
        case 'auth/operation-not-allowed':
          return 'Operation not allowed';
        case 'auth/weak-password':
          return 'Password is too weak';
        case 'auth/user-disabled':
          return 'This account has been disabled';
        case 'auth/user-not-found':
          return 'No account found with this email';
        case 'auth/wrong-password':
          return 'Incorrect password';
        case 'auth/invalid-credential':
          return 'Invalid email or password';
        case 'auth/too-many-requests':
          return 'Too many failed attempts. Please try again later';
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection';
        case 'auth/popup-closed-by-user':
          return 'Sign-in popup was closed';
        case 'auth/cancelled-popup-request':
          return 'Sign-in was cancelled';
        case 'auth/popup-blocked':
          return 'Popup was blocked by browser';
        case 'auth/unauthorized-domain':
          return 'This domain is not authorized for OAuth operations';
        default:
          return error.message || defaultMessage;
      }
    }
    return defaultMessage;
  }
}
