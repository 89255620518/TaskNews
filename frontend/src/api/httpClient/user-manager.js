export class UserManager {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  async handleGetAllUsers(data) {
    this._checkAuth(data);
    this._checkManagerOrAdmin(data);

    const users = JSON.parse(localStorage.getItem('users'));
    const page = parseInt(data.page) || 1;
    const limit = parseInt(data.limit) || 10;
    const offset = (page - 1) * limit;

    let filteredUsers = users;
    const tokenData = this._getTokenData(data);
    
    if (tokenData.role === 'manager') {
      filteredUsers = users.filter(user => user.role === 'user');
    }

    const paginatedUsers = filteredUsers.slice(offset, offset + limit)
      .map(user => ({ ...user, password: undefined }));

    return {
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page,
          limit,
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / limit)
        }
      }
    };
  }

  async handleCreateUser(data) {
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

  async handleGetUserById(data) {
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

  async handleUpdateUser(data) {
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

  async handleUpdateProfile(data) {
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

  async handleDeleteUser(data) {
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

  async handleUpdateUserRole(data) {
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

  _getTokenData(data) {
    const token = data.headers?.Authorization?.replace('Bearer ', '') || localStorage.getItem('accessToken');
    return this._verifyToken(token);
  }

  _verifyToken(token) {
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

  _checkAuth(data) {
    const tokenData = this._getTokenData(data);
    if (!tokenData) {
      throw { status: 401, message: 'Не авторизован' };
    }
    return tokenData;
  }

  _checkManagerOrAdmin(data) {
    const tokenData = this._checkAuth(data);
    if (tokenData.role !== 'admin' && tokenData.role !== 'manager') {
      throw { status: 403, message: 'Недостаточно прав' };
    }
    return tokenData;
  }
}