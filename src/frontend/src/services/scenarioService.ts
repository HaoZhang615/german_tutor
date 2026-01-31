import type { Scenario, ScenarioCreate, ScenarioGenerateRequest } from '../store/types';
import { getAccessToken, loadConfig } from './api';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config = await loadConfig();
  const url = `${config.apiUrl}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAccessToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const scenarioService = {
  async getAllScenarios(): Promise<Scenario[]> {
    return request<Scenario[]>('/api/scenarios');
  },

  async createScenario(scenario: ScenarioCreate): Promise<Scenario> {
    return request<Scenario>('/api/scenarios', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  },

  async deleteScenario(scenarioId: string): Promise<boolean> {
    const response = await request<{ success: boolean }>(`/api/scenarios/${scenarioId}`, {
      method: 'DELETE',
    });
    return response.success;
  },

  async generateScenario(generateRequest: ScenarioGenerateRequest): Promise<ScenarioCreate> {
    return request<ScenarioCreate>('/api/scenarios/generate', {
      method: 'POST',
      body: JSON.stringify(generateRequest),
    });
  },
};
