'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  auth,
  onAuthStateChanged,
  signInWithGoogle,
  signInWithGitHub,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  signOut as firebaseSignOut,
  getIdToken,
  User,
} from '@/lib/firebase-client';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState({ user, loading: false, error: null });
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInGoogle = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithGoogle();
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Sign in with GitHub
  const signInGitHub = useCallback(async () => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithGitHub();
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Sign in with email/password
  const signInEmail = useCallback(async (email: string, password: string) => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signInWithEmail(email, password);
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Sign up with email/password
  const signUpEmail = useCallback(async (email: string, password: string) => {
    try {
      setState((s) => ({ ...s, error: null }));
      await signUpWithEmail(email, password);
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Reset password
  const sendResetEmail = useCallback(async (email: string) => {
    try {
      setState((s) => ({ ...s, error: null }));
      await resetPassword(email);
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut();
    } catch (error: any) {
      setState((s) => ({ ...s, error: error.message }));
      throw error;
    }
  }, []);

  // Get current token (for API calls)
  const getToken = useCallback(async () => {
    return getIdToken();
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signInGoogle,
    signInGitHub,
    signInEmail,
    signUpEmail,
    sendResetEmail,
    signOut,
    getToken,
  };
}
