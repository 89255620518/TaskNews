export class HttpClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.interceptors = {
      request: [],
      response: []
    };
    this.delay = 200;
    
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
    const adminExists = users.find(user => user.email === 'admin@example.com');
    
    if (!adminExists) {
      const adminUser = {
        id: 1,
        firstName: 'Администратор',
        lastName: 'Системы',
        email: 'admin@example.com',
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
        role: 'admin',
        phoneNumber: '79991234567',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(adminUser);
      localStorage.setItem('users', JSON.stringify(users));
    }
  }

  // Имитация задержки
  async _simulateNetworkDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  _mapUrlToController(url, method) {
    const routes = {
      '/api/register': { method: 'POST', handler: this._handleRegister },
      '/api/login': { method: 'POST', handler: this._handleLogin },
      '/api/refresh': { method: 'POST', handler: this._handleRefresh },
      '/api/logout': { method: 'POST', handler: this._handleLogout },
      '/api/me': { method: 'GET', handler: this._handleGetCurrentUser },
      
      '/api/users': { 
        method: 'GET', 
        handler: this._handleGetAllUsers,
        POST: { method: 'POST', handler: this._handleCreateUser }
      },
      '/api/users/:id': { 
        method: 'GET', 
        handler: this._handleGetUserById,
        PUT: { method: 'PUT', handler: this._handleUpdateUser },
        DELETE: { method: 'DELETE', handler: this._handleDeleteUser }
      },
      '/api/users/:id/role': { method: 'PATCH', handler: this._handleUpdateUserRole },
      
      // Профиль
      '/api/profile': { method: 'PUT', handler: this._handleUpdateProfile }
    };

    const path = url.replace(this.baseURL, '');
    
    if (routes[path]) {
      const route = routes[path];
      if (route[method]) {
        return route[method].handler;
      }
      if (route.method === method) {
        return route.handler;
      }
    }

    for (const [routePath, routeConfig] of Object.entries(routes)) {
      if (routePath.includes(':')) {
        const pattern = new RegExp('^' + routePath.replace(/:\w+/g, '(\\w+)') + '$');
        const match = path.match(pattern);
        
        if (match) {
          const route = routeConfig;
          if (route[method]) {
            return (data) => route[method].handler({ ...data, id: match[1] });
          }
          if (route.method === method) {
            return (data) => route.handler({ ...data, id: match[1] });
          }
        }
      }
    }

    return null;
  }

  _handleRegister = async (data) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(user => user.email === data.email);
    
    if (existingUser) {
        throw { status: 400, message: 'Пользователь с таким email уже существует' };
    }

    const newUser = {
        id: Date.now(),
        firstName: data.firstName,
        lastName: data.lastName,
        patronymic: data.patronymic || '',
        email: data.email,
        password: this._hashPassword(data.password),
        phoneNumber: data.phoneNumber || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return {
        success: true,
        message: 'Регистрация успешна',
        data: {
            user: { ...newUser, password: undefined },
        }
    };
  }

  _handleLogin = async (data) => {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === data.email);
    
    if (!user) {
        throw { status: 401, message: 'Неверный email или пароль' };
    }

    if (!this._verifyPassword(data.password, user.password)) {
        throw { status: 401, message: 'Неверный email или пароль' };
    }

    const accessToken = this._generateToken(user.id, 'access');
    const refreshToken = this._generateToken(user.id, 'refresh');
    
    this._saveToken(accessToken, refreshToken, user.id);

    return {
        success: true,
        message: 'Вход выполнен успешно',
        data: {
            user: { ...user, password: undefined },
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    };
  }

  _handleRefresh = async (data) => {
    const oldRefreshToken = data.refreshToken || localStorage.getItem('refreshToken');
    if (!oldRefreshToken) {
        throw { status: 401, message: 'Refresh token не найден' };
    }

    const tokenData = this._verifyToken(oldRefreshToken);
    if (!tokenData || tokenData.type !== 'refresh') {
        throw { status: 403, message: 'Невалидный refresh token' };
    }

    const newAccessToken = this._generateToken(tokenData.userId, 'access');
    const newRefreshToken = this._generateToken(tokenData.userId, 'refresh');
    
    this._saveToken(newAccessToken, newRefreshToken, tokenData.userId);

    return {
        success: true,
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    };
  }

  _handleLogout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return {
        success: true,
        message: 'Выход выполнен успешно'
    };
  }

  _handleGetCurrentUser = async (data) => {
    const token = data.user?.token || localStorage.getItem('token');
    if (!token) {
      throw { status: 401, message: 'Пользователь не авторизован' };
    }

    const tokenData = this._verifyToken(token);
    if (!tokenData) {
      throw { status: 403, message: 'Невалидный токен' };
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id === tokenData.userId);
    if (!user) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    return {
      success: true,
      data: { ...user, password: undefined }
    };
  }

  _handleGetAllUsers = async (data) => {
    this._checkAuth(data);
    this._checkAdmin(data);

    const users = JSON.parse(localStorage.getItem('users'));
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;

    const paginatedUsers = users.slice(offset, offset + limit)
      .map(user => ({ ...user, password: undefined }));

    return {
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: users.length,
          pages: Math.ceil(users.length / limit)
        }
      }
    };
  }

  _handleCreateUser = async (data) => {
    this._checkAuth(data);
    this._checkAdmin(data);

    const users = JSON.parse(localStorage.getItem('users'));
    const existingUser = users.find(user => user.email === data.email);
    
    if (existingUser) {
      throw { status: 400, message: 'Пользователь с этим email уже существует' };
    }

    const newUser = {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      patronymic: data.patronymic || '',
      email: data.email,
      password: this._hashPassword(data.password),
      phoneNumber: data.phoneNumber || '',
      role: data.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      message: 'Пользователь успешно создан',
      data: { ...newUser, password: undefined }
    };
  }

  _handleGetUserById = async (data) => {
    this._checkAuth(data);

    const users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.id === parseInt(data.id));
    
    if (!user) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    const tokenData = this._getTokenData(data);
    if (tokenData.role !== 'admin' && tokenData.userId !== parseInt(data.id)) {
      throw { status: 403, message: 'Недостаточно прав' };
    }

    return {
      success: true,
      data: { ...user, password: undefined }
    };
  }

  _handleUpdateUser = async (data) => {
    this._checkAuth(data);

    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === parseInt(data.id));
    
    if (userIndex === -1) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    const tokenData = this._getTokenData(data);
    if (tokenData.role !== 'admin' && tokenData.userId !== parseInt(data.id)) {
      throw { status: 403, message: 'Недостаточно прав' };
    }

    const updatedUser = {
      ...users[userIndex],
      ...data,
      id: parseInt(data.id),
      updatedAt: new Date().toISOString()
    };

    if (data.email && data.email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === data.email && u.id !== parseInt(data.id));
      if (emailExists) {
        throw { status: 400, message: 'Пользователь с этим email уже существует' };
      }
    }

    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      message: 'Пользователь успешно обновлен',
      data: { ...updatedUser, password: undefined }
    };
  }

  _handleUpdateProfile = async (data) => {
    this._checkAuth(data);

    const tokenData = this._getTokenData(data);
    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === tokenData.userId);
    
    if (userIndex === -1) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    const updatedUser = {
      ...users[userIndex],
      ...data,
      id: tokenData.userId,
      updatedAt: new Date().toISOString()
    };

    if (data.email && data.email !== users[userIndex].email) {
      const emailExists = users.some(u => u.email === data.email && u.id !== tokenData.userId);
      if (emailExists) {
        throw { status: 400, message: 'Пользователь с этим email уже существует' };
      }
    }

    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      message: 'Профиль успешно обновлен',
      data: { ...updatedUser, password: undefined }
    };
  }

  _handleDeleteUser = async (data) => {
    this._checkAuth(data);
    this._checkAdmin(data);

    const tokenData = this._getTokenData(data);
    if (tokenData.userId === parseInt(data.id)) {
      throw { status: 400, message: 'Нельзя удалить собственный аккаунт' };
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === parseInt(data.id));
    
    if (userIndex === -1) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    users.splice(userIndex, 1);
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      message: 'Пользователь успешно удален'
    };
  }

  _handleUpdateUserRole = async (data) => {
    this._checkAuth(data);
    this._checkAdmin(data);

    const tokenData = this._getTokenData(data);
    if (tokenData.userId === parseInt(data.id)) {
      throw { status: 400, message: 'Нельзя изменить свою собственную роль' };
    }

    const users = JSON.parse(localStorage.getItem('users'));
    const userIndex = users.findIndex(u => u.id === parseInt(data.id));
    
    if (userIndex === -1) {
      throw { status: 404, message: 'Пользователь не найден' };
    }

    const validRoles = ['user', 'admin', 'manager', 'support'];
    if (!validRoles.includes(data.role)) {
      throw { status: 400, message: 'Некорректная роль' };
    }

    users[userIndex].role = data.role;
    users[userIndex].updatedAt = new Date().toISOString();
    localStorage.setItem('users', JSON.stringify(users));

    return {
      success: true,
      message: 'Роль пользователя успешно обновлена',
      data: { ...users[userIndex], password: undefined }
    };
  }

  _hashPassword(password) {
    return btoa(password) + '_hashed';
  }

  _verifyPassword(password, hash) {
    return btoa(password) + '_hashed' === hash;
  }

  _generateToken = (userId, type = 'access') => {
    const user = this._getUserById(userId);
    const now = Date.now();
    
    const payload = {
        userId,
        role: user?.role || 'user',
        email: user?.email || '',
        type: type,
        iat: now,
        exp: type === 'access' ? now + 900000 : now + 2592000000 // 15 минут / 30 дней
    };
    
    return btoa(JSON.stringify(payload));
  }

  _verifyToken = (token) => {
    try {
        if (!token) return null;
        
        const payload = JSON.parse(atob(token));
        
        if (payload.exp < Date.now()) {
            return null;
        }
        
        return payload;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
  }

  _saveToken = (accessToken, refreshToken, userId) => {
    try {
        const tokens = JSON.parse(localStorage.getItem('tokens')) || [];
        
        // Удаляем старые токены для этого пользователя
        const filteredTokens = tokens.filter(t => t.userId !== userId);
        
        // Добавляем новые токены
        filteredTokens.push({ 
            accessToken, 
            refreshToken,
            userId, 
            createdAt: new Date().toISOString() 
        });
        
        localStorage.setItem('tokens', JSON.stringify(filteredTokens));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    } catch (error) {
        console.error('Error saving token:', error);
    }
  }

  _getUserById(id) {
    const users = JSON.parse(localStorage.getItem('users'));
    return users.find(u => u.id === id);
  }

  _getTokenData(data) {
    const token = data.user?.token || localStorage.getItem('token');
    return this._verifyToken(token);
  }

  _checkAuth(data) {
    const tokenData = this._getTokenData(data);
    if (!tokenData) {
      throw { status: 401, message: 'Не авторизован' };
    }
    return tokenData;
  }

  _checkAdmin(data) {
    const tokenData = this._checkAuth(data);
    if (tokenData.role !== 'admin') {
      throw { status: 403, message: 'Недостаточно прав' };
    }
  }

  async _handleRequest(url, options) {
    await this._simulateNetworkDelay();

    let request = { url, options };
    for (const interceptor of this.interceptors.request) {
      request = await interceptor(request);
    }

    try {
      const method = options.method;
      const handler = this._mapUrlToController(url, method);

      if (!handler) {
        throw new Error(`Route not found: ${method} ${url}`);
      }

      let bodyData = {};
      if (options.body) {
        try {
          bodyData = JSON.parse(options.body);
        } catch (e) {
          console.warn('Failed to parse request body:', e);
        }
      }

      const urlParams = this._extractUrlParams(url);
      
      const token = options.headers?.Authorization?.replace('Bearer ', '');
      const user = token ? this._verifyToken(token) : null;

      const controllerData = {
        ...bodyData,
        ...urlParams,
        user: user
      };

      const result = await handler(controllerData);

      console.log(result, 'resa')
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

  async _handleRefreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.post('/api/refresh', { refreshToken });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    }
    
    throw new Error('Token refresh failed');
  }

  _extractUrlParams(url) {
    const params = {};
    const urlWithoutBase = url.replace(this.baseURL, '');
    const segments = urlWithoutBase.split('/').filter(seg => seg);
    
    segments.forEach((segment, index) => {
      if (segment.match(/^\d+$/)) {
        params.id = segment;
      }
      if (segment === 'role' && segments[index - 1] && segments[index - 1].match(/^\d+$/)) {
        params.id = segments[index - 1];
      }
    });

    return params;
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

  // Метод для настройки задержки
  setDelay(delay) {
    this.delay = delay;
  }

  // Метод для сброса данных (удобно для тестов)
  reset() {
    localStorage.removeItem('token');
    localStorage.removeItem('tokens');
    localStorage.removeItem('users');
    this._initStorage();
  }
}

export default HttpClient;