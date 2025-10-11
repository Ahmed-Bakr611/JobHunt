// src/app/core/services/auth.service.ts
import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { User, UserRole } from '../../shared/models/user.model';
import { Auth, onAuthStateChanged, signOut } from '@angular/fire/auth';
import { collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private db = inject(Firestore);
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

  constructor() {
    this.initAuthListener();
    console.log(this.currentUser());
    console.log(this.isAuthenticated());
  }

  /**
   * Initialize Firebase auth state listener
   */
  private initAuthListener(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        await this.loadUserProfile(firebaseUser.uid);
      } else {
        this.currentUserSignal.set(null);
      }
      this.loadingSignal.set(false);
    });
  }

  /**
   * Load user profile from Firestore
   */
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.currentUserSignal.set({
          uid,
          email: userData['email'],
          displayName: userData['displayName'],
          photoURL: userData['photoURL'],
          role: userData['role'],
          createdAt: userData['createdAt'].toDate(),
          updatedAt: userData['updatedAt'].toDate(),
        } as User);
      } else {
        console.warn('User document does not exist for uid:', uid);
        this.currentUserSignal.set(null);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
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
    role: UserRole
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

      // Create user document in Firestore
      const user: User = {
        uid: userCredential.user.uid,
        email,
        displayName,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.debug(user);
      await setDoc(doc(this.db, 'users', user.uid), user);

      // Update local state
      this.currentUserSignal.set(user);

      // Navigate based on role
      this.navigateByRole(role);
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

      await signInWithEmailAndPassword(this.auth, email, password);

      // User will be loaded by auth listener
      // Wait for user to be loaded
      await this.waitForUser();

      // Navigate based on role
      const role = this.userRole();
      if (role) {
        this.navigateByRole(role);
      }
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Sign in failed');
      this.errorSignal.set(message);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(role: UserRole): Promise<void> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(this.auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(this.db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        // Create new user document
        const user: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || undefined,
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(doc(this.db, 'users', user.uid), user);
        this.currentUserSignal.set(user);
      } else {
        // Load existing user
        await this.loadUserProfile(firebaseUser.uid);
      }

      this.navigateByRole(role);
    } catch (error: unknown) {
      const message = this.getErrorMessage(error, 'Google sign in failed');
      this.errorSignal.set(message);
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
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const user = this.currentUser();
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      // Update Firestore
      await updateDoc(doc(this.db, 'users', user.uid), {
        ...updates,
        updatedAt: new Date(),
      });

      // Update local state
      this.currentUserSignal.set({
        ...user,
        ...updates,
        updatedAt: new Date(),
      });
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
      // Firebase auth errors
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
        default:
          return error.message || defaultMessage;
      }
    }
    return defaultMessage;
  }
}
