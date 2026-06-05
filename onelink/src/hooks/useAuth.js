import { useAuth, useUser } from '@clerk/clerk-react';

export function useClerkAuth() {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  return {
    isSignedIn,
    user,
    signOut,
  };
}

export { useClerkAuth as useAuth };
export default useAuth;

