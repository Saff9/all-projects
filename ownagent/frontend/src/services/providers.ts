import { apiClient } from './api';
import type { Provider } from '../types';

interface ProvidersResponse {
  providers: Provider[];
}

interface ProviderTestResponse {
  provider: string;
  status: string;
  latency_ms: number;
  tested_at: string;
}

class ProviderService {
  async getProviders(): Promise<Provider[]> {
    const response = await apiClient.get<ProvidersResponse>('/providers');
    return response.providers;
  }

  async getProviderModels(providerId: string): Promise<Provider> {
    return apiClient.get<Provider>(`/providers/${providerId}/models`);
  }

  async testProvider(providerId: string): Promise<ProviderTestResponse> {
    return apiClient.post<ProviderTestResponse>(`/providers/${providerId}/test`);
  }
}

export const providerService = new ProviderService();
export default providerService;