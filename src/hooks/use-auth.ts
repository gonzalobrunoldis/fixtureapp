'use client';

import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface AuthError {
  message: string;
  status?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const signUp = async (
    data: SignUpData
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred during sign up',
        },
      };
    }
  };

  const signIn = async (
    data: SignInData
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      router.push('/home');
      router.refresh();

      return { error: null };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred during sign in',
        },
      };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      router.push('/login');
      router.refresh();

      return { error: null };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred during sign out',
        },
      };
    }
  };

  const resetPassword = async (
    email: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred during password reset',
        },
      };
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: { message: error.message, status: error.status } };
      }

      return { error: null };
    } catch (error) {
      return {
        error: {
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred during password update',
        },
      };
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };
}
