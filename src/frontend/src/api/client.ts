const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, name: string) =>
    apiRequest('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, is_active: true }),
    }),
};

export const userApi = {
  getProfile: (userId: number) =>
    apiRequest(`/api/v1/users/${userId}`),

  updateProfile: (userId: number, data: Record<string, unknown>) =>
    apiRequest(`/api/v1/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  saveOnboardingData: (userId: number, onboardingData: Record<string, unknown>) =>
    apiRequest(`/api/v1/users/${userId}/onboarding`, {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    }),
};

export default apiRequest;
