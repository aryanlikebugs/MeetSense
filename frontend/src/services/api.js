const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem('meetsense_token');
  const headers = {
    'Content-Type': 'application/json',
    ...extra,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || 'API error';
    throw new Error(message);
  }
  return data;
}

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async put(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async patch(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async upload(endpoint, formData) {
    const token = localStorage.getItem('meetsense_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: formData,
    });
    return handleResponse(response);
  },
};
