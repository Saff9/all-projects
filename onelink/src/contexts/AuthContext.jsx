import React, { useState, useEffect, createContext, useCallback } from 'react';
import { useAuth, useUser, useSignUp, useSignIn } from '@clerk/clerk-react';
import { profilesApi } from '../lib/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export function useSession() {
  const { isSignedIn, signOut, user, getToken } = useAuth();
  const { user: clerkUser } = useUser();

  return {
    isSignedIn,
    user: clerkUser,
    signOut,
    getToken,
  };
}

export { useAuth, useUser };

export function AuthProvider({ children }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isSignedIn, user } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { signUp, setActive: setSignUpActive } = useSignUp();
  const { signIn, setActive: setSignInActive } = useSignIn();

  const navigate = useNavigate();

  // Fetch user profile from backend
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      const profile = await profilesApi.getByUserId(userId);
      setUserProfile(profile);
      return profile;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUserProfile(null);
      return null;
    }
  }, []);

  // Create user profile in backend
  const createUserProfile = useCallback(async (userId, userData) => {
    try {
      // The profile is created automatically via database triggers when a user is created
      // Just fetch it
      return await fetchUserProfile(userId);
    } catch (err) {
      console.error('Failed to create user profile:', err);
      throw err;
    }
  }, [fetchUserProfile]);

  // Sign up with magic link (email link)
  async function signup(email, displayName) {
    if (!signUp) {
      throw new Error('Sign up is not ready');
    }

    try {
      setError(null);

      await signUp.create({
        emailAddress: email,
        firstName: displayName,
      });

      // Prepare for email verification (magic link)
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_link',
        redirectUrl: `${window.location.origin}/verify-email`,
      });

      return { success: true, message: 'Magic link sent!' };
    } catch (err) {
      const message = err.errors?.[0]?.message || 'Sign up failed';
      setError(message);
      throw new Error(message);
    }
  }

  // Sign in with magic link
  async function login(email) {
    if (!signIn) {
      throw new Error('Sign in is not ready');
    }

    try {
      setError(null);

      await signIn.create({
        identifier: email,
        strategy: 'email_link',
        redirectUrl: `${window.location.origin}/verify-email`,
      });

      return { success: true, message: 'Magic link sent!' };
    } catch (err) {
      const message = err.errors?.[0]?.message || 'Sign in failed';
      setError(message);
      throw new Error(message);
    }
  }

  // OAuth login handlers
  async function loginWithGoogle(redirectUrl = window.location.origin) {
    if (!signIn) {
      throw new Error('Sign in is not ready');
    }

    try {
      setError(null);
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl,
      });
    } catch (err) {
      const message = err.errors?.[0]?.message || 'Google sign in failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function loginWithGithub(redirectUrl = window.location.origin) {
    if (!signIn) {
      throw new Error('Sign in is not ready');
    }

    try {
      setError(null);
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_github',
        redirectUrl,
      });
    } catch (err) {
      const message = err.errors?.[0]?.message || 'GitHub sign in failed';
      setError(message);
      throw new Error(message);
    }
  }

  // Logout
  function logout() {
    signOut();
    setUserProfile(null);
  }

  // Update user profile
  async function updateUserProfile(data) {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await profilesApi.update(user.id, data);
      await fetchUserProfile(user.id);
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  }

  // Check if user has completed profile setup
  async function hasCompletedProfile(userId) {
    if (!userProfile) return false;
    return userProfile.isPublished || userProfile.displayName || userProfile.bio;
  }

  // Listen for auth state changes
  useEffect(() => {
    const shouldLoad = userLoaded && isSignedIn !== undefined;

    if (!shouldLoad) {
      return;
    }

    setLoading(true);

    if (isSignedIn && user) {
      fetchUserProfile(user.id)
        .finally(() => setLoading(false));
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [isSignedIn, user, userLoaded, fetchUserProfile]);

  const value = {
    currentUser: clerkUser,
    userProfile,
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    loginWithGithub,
    logout,
    updateUserProfile,
    fetchUserProfile,
    hasCompletedProfile,
    // Expose signUp and signIn for email verification flow
    signUp,
    signIn,
  };

  // Don't render children until user data is loaded
  if (!userLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
