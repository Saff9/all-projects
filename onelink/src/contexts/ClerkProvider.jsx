import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';

export function ClerkWrapper({ children }) {
  return <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
    {children}
  </ClerkProvider>;
}

export { useAuth, useUser };

