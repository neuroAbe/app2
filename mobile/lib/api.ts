// API client for interacting with backend endpoints

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Encounters API
export const encountersApi = {
  getNearby: () => apiCall('/api/encounters/nearby'),
};

// Matches API
export const matchesApi = {
  getAll: () => apiCall('/api/matches'),
  create: (otherUserId: string, encounterLocation: string) =>
    apiCall('/api/matches', {
      method: 'POST',
      body: { otherUserId, encounterLocation },
    }),
  update: (matchId: string, status: 'accepted' | 'rejected') =>
    apiCall('/api/matches', {
      method: 'PATCH',
      body: { matchId, status },
    }),
};

// Safety API
export const safetyApi = {
  blockUser: (blockedUserId: string) =>
    apiCall('/api/safety/block', {
      method: 'POST',
      body: { blockedUserId },
    }),
  unblockUser: (blockedUserId: string) =>
    apiCall('/api/safety/block', {
      method: 'DELETE',
      body: { blockedUserId },
    }),
  reportUser: (reportedUserId: string, reason: string, description: string) =>
    apiCall('/api/safety/report', {
      method: 'POST',
      body: { reportedUserId, reason, description },
    }),
};
