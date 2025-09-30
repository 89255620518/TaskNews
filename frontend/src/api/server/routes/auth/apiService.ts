import { 
  register, 
  login, 
  refresh, 
  updateUser, 
  getUserById, 
  getAllUsers, 
  deleteUser, 
  createUser, 
  logout, 
  updateUserRole, 
  getCurrentUser 
} from '../../controllers/authController';
import { authenticate } from '../../middlewares/authMiddleware';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken() {
    return this.token || localStorage.getItem('token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  private async authenticateRequest() {
    const token = this.getToken();
    const authResult = await authenticate(token || '');
    
    if (authResult.error) {
      throw new Error(authResult.error);
    }
    
    return authResult.user;
  }

  private async makeRequest(apiCall: Function, data?: any, requiresAuth: boolean = false) {
    try {
      let user = null;
      
      if (requiresAuth) {
        user = await this.authenticateRequest();
      }

      const requestData = requiresAuth ? { ...data, user } : data;
      
      const result = await apiCall(requestData);
      return result;
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error && error.message.includes('токен')) {
        this.clearToken();
      }
      
      throw error;
    }
  }

  async register(userData: any) {
    return this.makeRequest(register, userData, false);
  }

  async login(credentials: any) {
    const result = await this.makeRequest(login, credentials, false);
    if (result.data.accessToken) {
      this.setToken(result.data.accessToken);
      
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
    }
    return result;
  }

  async refresh() {
    const refreshToken = localStorage.getItem('refreshToken');
    const result = await this.makeRequest(refresh, { refreshToken }, false);
    if (result.data.accessToken) {
      this.setToken(result.data.accessToken);
    }
    return result;
  }

  async logout() {
    const result = await this.makeRequest(logout, {}, true);
    this.clearToken();
    return result;
  }

  async getCurrentUser() {
    return this.makeRequest(getCurrentUser, {}, true);
  }

  async updateProfile(userData: any) {
    return this.makeRequest(updateUser, userData, true);
  }

  async getAllUsers() {
    return this.makeRequest(getAllUsers, {}, true);
  }

  async getUserById(id: string) {
    return this.makeRequest(getUserById, { id }, true);
  }

  async createUser(userData: any) {
    return this.makeRequest(createUser, userData, true);
  }

  async updateUserRole(id: string, role: string) {
    return this.makeRequest(updateUserRole, { id, role }, true);
  }

  async deleteUser(id: string) {
    return this.makeRequest(deleteUser, { id }, true);
  }

  async checkAuth() {
    try {
      const user = await this.authenticateRequest();
      return { user, error: null };
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Ошибка аутентификации' };
    }
  }
}

export const apiService = new ApiService();