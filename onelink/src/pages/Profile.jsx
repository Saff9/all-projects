import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PublicProfileWrapperWithSEO } from '../components/public';

/**
 * Profile Page Component
 * Public profile page that displays user's links
 * Route: /:username or /u/:username
 */
function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();

  // Redirect /u/username to /username for consistency
  useEffect(() => {
    // This effect handles the case where someone lands on /u/username
    // We keep the same component but the route is handled in App.jsx
  }, [username]);

  return <PublicProfileWrapperWithSEO />;
}

export default Profile;