import { apiClient } from './api';

export const authService = {
  async login(email, password) {
    const result = await apiClient.post('/auth/login', { email, password });
    if (result?.token) localStorage.setItem('meetsense_token', result.token);
    if (result?.user) localStorage.setItem('meetsense_user', JSON.stringify(result.user));
    return result;
  },

  async signup(name, email, password) {
    const result = await apiClient.post('/auth/signup', { name, email, password });
    if (result?.token) localStorage.setItem('meetsense_token', result.token);
    if (result?.user) localStorage.setItem('meetsense_user', JSON.stringify(result.user));
    return result;
  },

  async logout() {
    localStorage.removeItem('meetsense_token');
    localStorage.removeItem('meetsense_user');
    return { success: true };
  },

  async getCurrentUser() {
    return apiClient.get('/auth/me');
  },

  async updateProfile({ name, email, password, avatarFile } = {}) {
    if (avatarFile) {
      const form = new FormData();
      if (name) form.append('name', name);
      if (email) form.append('email', email);
      if (password) form.append('password', password);
      form.append('avatar', avatarFile);
      return apiClient.upload('/users/update', form);
    }
    return apiClient.patch('/users/update', { name, email, password });
  },
};
