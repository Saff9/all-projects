const API_BASE = import.meta.env.DEV ? 'http://localhost:8787' : '/api';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('clerk-jwt') || '';
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Profiles
export const profilesApi = {
  getByUserId: (userId: string) => apiRequest(`/profiles/${userId}`),
  update: (userId: string, data: any) => apiRequest(`/profiles/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  publish: (userId: string) => apiRequest(`/profiles/${userId}/publish`, { method: 'POST' }),
};

// Links
export const linksApi = {
  getByProfileId: (profileId: string) => apiRequest(`/links/${profileId}`),
  create: (profileId: string, data: any) => apiRequest(`/links/${profileId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (linkId: string, data: any) => apiRequest(`/links/${linkId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (linkId: string) => apiRequest(`/links/${linkId}`, { method: 'DELETE' }),
};

// Analytics
export const analyticsApi = {
  getByProfile: (profileId: string, params = '') => apiRequest(`/analytics/${profileId}${params ? `?${params}` : ''}`),
  track: (profileId: string, data: any) => apiRequest(`/analytics/${profileId}/track`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

