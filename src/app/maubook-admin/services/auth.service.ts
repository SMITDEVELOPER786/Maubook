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
        } else {
          this.currentUserSubject.next(null);
          this.setLoginStatus(false); // Sync login status
        }
      } catch (error) {
        console.error('Error processing auth state:', error);
        this.currentUserSubject.next(null);
        this.setLoginStatus(false);
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
    }
  }

  async logout(): Promise<void> {
    await this.afAuth.signOut();
    this.currentUserSubject.next(null);
    this.setLoginStatus(false);
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
}