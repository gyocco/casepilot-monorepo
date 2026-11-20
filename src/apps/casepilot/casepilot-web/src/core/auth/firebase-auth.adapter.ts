import { Injectable, inject } from '@angular/core';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import { AppConfigStore } from '../config/app-config';
import type { AuthProviderAdapter, AuthSessionUser } from './auth.models';

function mapFirebaseUser(user: FirebaseUser): AuthSessionUser {
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
  };
}

function mapFirebaseError(error: unknown): Error {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code: unknown }).code)
    : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return new Error('Correo o contraseña incorrectos.');
    case 'auth/email-already-in-use':
      return new Error('Ya existe una cuenta registrada con ese correo.');
    case 'auth/weak-password':
      return new Error('La contraseña debe tener al menos 6 caracteres.');
    case 'auth/invalid-email':
      return new Error('Ingresa un correo electrónico válido.');
    case 'auth/too-many-requests':
      return new Error('Demasiados intentos. Espera unos minutos antes de reintentar.');
    case 'auth/network-request-failed':
      return new Error('No se pudo conectar con el servicio de autenticación.');
    default:
      return new Error('No se pudo completar la autenticación.');
  }
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthAdapter implements AuthProviderAdapter {
  private readonly configStore = inject(AppConfigStore);
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private emulatorConnected = false;

  private getAuthInstance(): Auth {
    if (this.auth) return this.auth;
    const config = this.configStore.config();
    const appName = `casepilot-web-${config.environment}`;
    const existing = getApps().find(candidate => candidate.name === appName);
    this.app = existing ?? initializeApp(config.firebase, appName);
    this.auth = getAuth(this.app);
    if (config.environment === 'local' && config.authEmulatorUrl && !this.emulatorConnected) {
      connectAuthEmulator(this.auth, config.authEmulatorUrl, { disableWarnings: true });
      this.emulatorConnected = true;
    }
    return this.auth;
  }

  watchAuthState(callback: (user: AuthSessionUser | null) => void): () => void {
    return onAuthStateChanged(this.getAuthInstance(), user => {
      callback(user ? mapFirebaseUser(user) : null);
    });
  }

  async signInWithEmail(email: string, password: string): Promise<AuthSessionUser> {
    try {
      const credential = await signInWithEmailAndPassword(this.getAuthInstance(), email.trim(), password);
      return mapFirebaseUser(credential.user);
    } catch (error: unknown) {
      throw mapFirebaseError(error);
    }
  }

  async signUpWithEmail(email: string, password: string, displayName: string): Promise<AuthSessionUser> {
    try {
      const credential = await createUserWithEmailAndPassword(this.getAuthInstance(), email.trim(), password);
      const trimmedName = displayName.trim();
      if (trimmedName.length > 0) {
        await updateProfile(credential.user, { displayName: trimmedName });
      }
      return mapFirebaseUser(credential.user);
    } catch (error: unknown) {
      throw mapFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.getAuthInstance());
  }

  async getIdToken(forceRefresh = false): Promise<string | null> {
    const current = this.getAuthInstance().currentUser;
    if (!current) return null;
    return current.getIdToken(forceRefresh);
  }

  // Keep reference to getApp cleanly unused-free via appName lookup above
  protected resolveExistingApp(name: string): FirebaseApp {
    return getApp(name);
  }
}
