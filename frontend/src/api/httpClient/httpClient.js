import { RequestHandler } from './request-handler.js';
import { AuthManager } from './auth-manager.js';
import { UserManager } from './user-manager.js';

export class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: []
    };
    this.delay = 200;
    
    this.requestHandler = new RequestHandler(this);
    this.authManager = new AuthManager(this);
    this.userManager = new UserManager(this);
    
    this._initStorage();
  }

  _initStorage() {
    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }
    if (!localStorage.getItem('tokens')) {
      localStorage.setItem('tokens', JSON.stringify([]));
    }
    
    this._createTestAdmin();
  }

  async _createTestAdmin() {
    const users = JSON.parse(localStorage.getItem('users'));
    
    const adminEmail = 'admin@mail.ru';
    const adminPassword = 'Restart987';
    const adminFirstName = 'Иброхим';
    const adminLastName = 'Эргешев';
    
    const filteredUsers = users.filter(user => user.role !== 'admin' || user.email === adminEmail);
    
    const adminExists = filteredUsers.find(user => user.email === adminEmail);
    
    if (!adminExists) {
      const adminUser = {
        id: 1,
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: btoa(adminPassword) + '_hashed',
        role: 'admin',
        phoneNumber: '79991234567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      filteredUsers.push(adminUser);
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      console.log('✅ Администратор создан с вашими данными');
    } else {
      
      const adminIndex = filteredUsers.findIndex(user => user.email === adminEmail);
      filteredUsers[adminIndex] = {
        ...filteredUsers[adminIndex],
        firstName: adminFirstName,
        lastName: adminLastName,
        password: btoa(adminPassword) + '_hashed',
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('users', JSON.stringify(filteredUsers));
      console.log('✅ Данные администратора обновлены');
    }
  }

  async _simulateNetworkDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  async _handleRequest(url, options) {
    await this._simulateNetworkDelay();

    let request = { url, options };
    for (const interceptor of this.interceptors.request) {
      request = await interceptor(request);
    }

    try {
      const result = await this.requestHandler.handleRequest(url, options);

      let responseData = result;
      for (const responseInterceptor of this.interceptors.response) {
        responseData = await responseInterceptor(responseData);
      }

      return this._createHttpResponse(responseData);
    } catch (error) {
      console.error('API Error:', error);
      throw this._createErrorResponse(error);
    }
  }

  _createHttpResponse(data) {
    return {
      status: data.status || 200,
      data: data.data || data,
      success: data.success !== undefined ? data.success : true
    };
  }

  _createErrorResponse(error) {
    const errorResponse = new Error(error.message || 'Internal Server Error');
    errorResponse.response = {
      status: error.status || 500,
      data: {
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    };
    return errorResponse;
  }

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  async get(url) {
    return this._handleRequest(url, {
      method: 'GET',
      headers: this._getHeaders()
    });
  }

  async post(url, data) {
    return this._handleRequest(url, {
      method: 'POST',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async put(url, data) {
    return this._handleRequest(url, {
      method: 'PUT',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async patch(url, data) {
    return this._handleRequest(url, {
      method: 'PATCH',
      headers: this._getHeaders(),
      body: JSON.stringify(data)
    });
  }

  async delete(url) {
    return this._handleRequest(url, {
      method: 'DELETE',
      headers: this._getHeaders()
    });
  }

  _getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return headers;
  }

  setDelay(delay) {
    this.delay = delay;
  }

  reset() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokens');
    localStorage.removeItem('users');
    this._initStorage();
  }
}

export default HttpClient;