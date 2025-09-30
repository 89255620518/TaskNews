export class AuthManager {
  constructor(httpClient) {
    this.httpClient = httpClient;
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
        exp: type === 'access' ? now + 900000 : now + 2592000000
    };
    
    return btoa(JSON.stringify(payload));
  }

  _verifyToken = (token) => {
    try {
        if (!token || token === 'null' || token === 'undefined') {
            return null;
        }
        
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
        
        const filteredTokens = tokens.filter(t => t.userId !== userId);
        
        filteredTokens.push({ 
            accessToken, 
            refreshToken,
            userId, 
            createdAt: new Date().toISOString() 
        });
        
        localStorage.setItem('tokens', JSON.stringify(filteredTokens));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('✅ Токены успешно сохранены для пользователя:', userId);
    } catch (error) {
        console.error('Error saving token:', error);
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }
  }

  _getUserById(id) {
    const users = JSON.parse(localStorage.getItem('users'));
    return users.find(u => u.id === id);
  }

  _getTokenData(data) {
    const token = data.headers?.Authorization?.replace('Bearer ', '') || localStorage.getItem('accessToken');
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

  async handleRegister(data) {
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
            user: { ...newUser, password: undefined }
        }
    };
  }

  async handleLogin(data) {
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

  async handleRefresh(data) {
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

  async handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return {
        success: true,
        message: 'Выход выполнен успешно'
    };
  }

  async handleGetCurrentUser(data) {
    const token = data.headers?.Authorization?.replace('Bearer ', '') || localStorage.getItem('accessToken');
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
}