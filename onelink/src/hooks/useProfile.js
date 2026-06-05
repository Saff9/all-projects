import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '../lib/api';
import { useUser } from '@clerk/clerk-react';

export function useProfile() {
  const { user } = useUser();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => profilesApi.getByUserId(user.id),
    enabled: !!user?.id,
  });
}

export default useProfile;

