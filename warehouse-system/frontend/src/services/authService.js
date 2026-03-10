import api from './api';

class AuthService {
  async login(username, password) {
    const response = await api.post('/token/', { username, password });
    return response.data;
  }

  async getProfile() {
    const response = await api.get('/users/me/');
    return response.data;
  }

  async updateProfile(data) {
    const response = await api.put('/users/me/', data);
    return response.data;
  }
}

export default new AuthService();