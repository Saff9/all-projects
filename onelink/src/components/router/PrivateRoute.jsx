import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Loading } from '../ui';

function PrivateRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();

  if (!isLoaded) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isSignedIn) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
}

export function PrivateRouteNoVerification({ children }) {
  return <PrivateRoute>{children}</PrivateRoute>;
}

export default PrivateRoute;

