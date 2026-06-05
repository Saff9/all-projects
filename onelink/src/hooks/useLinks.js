import { useQuery } from '@tanstack/react-query';
import { linksApi } from '../lib/api';

export function useLinks(profileId) {
  return useQuery({
    queryKey: ['links', profileId],
    queryFn: () => linksApi.getByProfileId(profileId),
    enabled: !!profileId,
  });
}

export default useLinks;

