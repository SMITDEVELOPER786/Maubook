import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject } from 'rxjs';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public authState$ = this.currentUserSubject.asObservable();
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading$ = this.loadingSubject.asObservable();
  private initialized = false;
  private isLoggedInStatus: boolean = false;

  constructor(private afAuth: AngularFireAuth) {
    this.afAuth.authState.subscribe(async (firebaseUser) => {
      try {
        this.initialized = true;

        if (firebaseUser) {
          const displayName = firebaseUser.displayName || 'User';
          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName,
            firstName: displayName.split(' ')[0],
            phoneNumber: firebaseUser.phoneNumber || '',
            photoURL: firebaseUser.photoURL || ''
          };
          this.currentUserSubject.next(user);
          this.setLoginStatus(true); // Sync login status
          
          // Store user data in localStorage
          this.storeUserData(user);
        } else {
          this.currentUserSubject.next(null);
          this.setLoginStatus(false); // Sync login status
          
          // Clear user data from localStorage
          this.clearUserData();
        }
      } catch (error) {
        console.error('Error processing auth state:', error);
        this.currentUserSubject.next(null);
        this.setLoginStatus(false);
        
        // Clear user data from localStorage on error
        this.clearUserData();
      } finally {
        this.loadingSubject.next(false);
      }
    });
    // Avoid relying solely on localStorage for initial state
    // Instead, let Firebase authState determine the status
  }

  isAuthInitialized(): boolean {
    return this.initialized;
  }

  async signOutOnTabClose(): Promise<void> {
    try {
      const auth = getAuth();
      await setPersistence(auth, browserSessionPersistence);
      await this.afAuth.signOut();
      this.currentUserSubject.next(null);
      this.setLoginStatus(false);
    } catch (error) {
      console.error('Error signing out on tab close:', error);
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const firebaseUser = credential.user;

    if (firebaseUser) {
      await firebaseUser.updateProfile({ displayName });
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        firstName: displayName.split(' ')[0],
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || ''
      };
      this.currentUserSubject.next(user);
      this.setLoginStatus(true);
      
      // Store user UID and email in localStorage
      this.storeUserData(user);
    }
  }

  async login(email: string, password: string): Promise<void> {
    const credential = await this.afAuth.signInWithEmailAndPassword(email, password);
    const firebaseUser = credential.user;

    if (firebaseUser) {
      const displayName = firebaseUser.displayName || 'User';
      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        firstName: displayName.split(' ')[0],
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || ''
      };
      this.currentUserSubject.next(user);
      this.setLoginStatus(true);
      
      // Store user UID and email in localStorage
      this.storeUserData(user);
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.currentUserSubject.next(null);
    this.setLoginStatus(false);
    
    // Clear user data from localStorage
    this.clearUserData();
  }

  async resetPassword(email: string): Promise<void> {
    await this.afAuth.sendPasswordResetEmail(email);
  }

  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = await this.afAuth.currentUser;
    if (firebaseUser) {
      const displayName = firebaseUser.displayName || 'User';
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName,
        firstName: displayName.split(' ')[0],
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || ''
      };
    }
    return null;
  }

  async updateUserProfile(data: { displayName?: string; email?: string }): Promise<void> {
    const firebaseUser = await this.afAuth.currentUser;
    if (firebaseUser) {
      if (data.displayName) {
        await firebaseUser.updateProfile({ displayName: data.displayName });
      }
      if (data.email) {
        await firebaseUser.updateEmail(data.email);
      }
      const updatedUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || 'User',
        firstName: firebaseUser.displayName?.split(' ')[0] || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        photoURL: firebaseUser.photoURL || ''
      };
      this.currentUserSubject.next(updatedUser);
      
      // Update user data in localStorage
      this.storeUserData(updatedUser);
    } else {
      throw new Error('No authenticated user found.');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const firebaseUser = await this.afAuth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('No authenticated user found.');
    }

    const credential = firebase.auth.EmailAuthProvider.credential(firebaseUser.email, currentPassword);
    await firebaseUser.reauthenticateWithCredential(credential);
    await firebaseUser.updatePassword(newPassword);
  }

  public isLoggedIn(): boolean {
    return this.isLoggedInStatus;
  }

  public setLoginStatus(status: boolean): void {
    this.isLoggedInStatus = status;
    localStorage.setItem('isLoggedIn', status.toString());
  }

  // Store user data in localStorage
  private storeUserData(user: User): void {
    localStorage.setItem('userUID', user.uid);
    localStorage.setItem('userEmail', user.email);
    localStorage.setItem('userDisplayName', user.displayName || '');
    localStorage.setItem('userFirstName', user.firstName || '');
    localStorage.setItem('isLoggedIn', "true");
  }

  // Clear user data from localStorage
  private clearUserData(): void {
    localStorage.removeItem('userUID');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userDisplayName');
    localStorage.removeItem('userFirstName');
  }

  // Get user UID from localStorage
  public getUserUID(): string | null {
    return localStorage.getItem('userUID');
  }

  // Get user email from localStorage
  public getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  // Get user display name from localStorage
  public getUserDisplayName(): string | null {
    return localStorage.getItem('userDisplayName');
  }

  // Get user first name from localStorage
  public getUserFirstName(): string | null {
    return localStorage.getItem('userFirstName');
  }

  // Check if user data exists in localStorage
  public hasStoredUserData(): boolean {
    return !!(localStorage.getItem('userUID') && localStorage.getItem('userEmail'));
  }
}