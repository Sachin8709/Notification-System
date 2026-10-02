const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Token ${token}` } : {}),
  };
}

async function request(endpoint, options = {}) {
  const url = `${API_URL}/api${endpoint}`;
  const headers = getAuthHeaders();

  const config = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);
    
    // Handle 204 No Content
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();
    if (!response.ok) {
      const err = new Error(data.error || data.detail || 'API request failed');
      err.status = response.status;
      throw err;
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Accounts / Auth
  login: async (username, password, phone_number = null, onesignal_subscription_id = null) => {
    const data = await request('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password, phone_number, onesignal_subscription_id }),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
    }
    return data;
  },

  logout: async () => {
    try {
      await request('/accounts/logout/', { method: 'POST' });
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
    }
  },

  register: async (userData) => {
    const data = await request('/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('profile', JSON.stringify(data.profile));
    }
    return data;
  },

  getMe: async () => {
    return await request('/accounts/me/');
  },

  updateMe: async (profileData) => {
    return await request('/accounts/me/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  // Notification Triggers & Templates Matrix
  getTriggers: async () => {
    return await request('/notifications/triggers/');
  },

  createTrigger: async (triggerData) => {
    return await request('/notifications/triggers/', {
      method: 'POST',
      body: JSON.stringify(triggerData),
    });
  },

  updateTrigger: async (id, triggerData) => {
    return await request(`/notifications/triggers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(triggerData),
    });
  },

  deleteTrigger: async (id) => {
    return await request(`/notifications/triggers/${id}/`, {
      method: 'DELETE',
    });
  },

  saveTemplate: async (templateData) => {
    return await request('/notifications/templates/', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  },

  toggleTemplate: async (templateId, is_active) => {
    return await request(`/notifications/templates/${templateId}/toggle/`, {
      method: 'POST',
      body: JSON.stringify({ is_active }),
    });
  },

  testSendTemplate: async (templateId, payload = {}) => {
    return await request(`/notifications/templates/${templateId}/test-send/`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  testSendTrigger: async (triggerKey) => {
    return await request('/notifications/test-send/', {
      method: 'POST',
      body: JSON.stringify({ trigger_key: triggerKey }),
    });
  }
};
