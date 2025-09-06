const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

class ApiError extends Error {
  constructor(public status: number, message: string, public errors?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}`,
        errorData.errors
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error occurred');
  }
}

export const api = {
  // Auth
  login: (credentials: { username: string; password: string }) =>
    apiRequest<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  // Master data
  getGates: () => apiRequest<any[]>('/master/gates'),
  
  getZones: (gateId?: string) => {
    const params = gateId ? `?gateId=${gateId}` : '';
    return apiRequest<any[]>(`/master/zones${params}`);
  },
  
  getCategories: () => apiRequest<any[]>('/master/categories'),

  // Subscriptions
  getSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}`),

  // Tickets
  checkin: (data: {
    gateId: string;
    zoneId: string;
    type: 'visitor' | 'subscriber';
    subscriptionId?: string;
  }) =>
    apiRequest<any>('/tickets/checkin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  checkout: (data: { ticketId: string; forceConvertToVisitor?: boolean }) =>
    apiRequest<any>('/tickets/checkout', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTicket: (id: string) => apiRequest<any>(`/tickets/${id}`),

  // Admin endpoints
  getParkingState: (token: string) =>
    apiRequest<any[]>('/admin/reports/parking-state', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateCategory: (id: string, data: any, token: string) =>
    apiRequest<any>(`/admin/categories/${id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  updateZoneStatus: (id: string, open: boolean, token: string) =>
    apiRequest<any>(`/admin/zones/${id}/open`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ open }),
    }),

  addRushHour: (data: any, token: string) =>
    apiRequest<any>('/admin/rush-hours', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  addVacation: (data: any, token: string) =>
    apiRequest<any>('/admin/vacations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),

  getSubscriptions: (token: string) =>
    apiRequest<any[]>('/admin/subscriptions', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export { ApiError };