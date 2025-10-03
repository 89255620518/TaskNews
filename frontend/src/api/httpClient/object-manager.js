export class PropertyManager {
  constructor(httpClient) {
    this.httpClient = httpClient;
    this.storageKey = 'properties';
  }

  _initStorage() {
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  _generateId() {
    const properties = this._getAllProperties();
    return properties.length > 0 ? Math.max(...properties.map(prop => prop.id)) + 1 : 1;
  }

  _getAllProperties() {
    this._initStorage();
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  _saveProperties(properties) {
    localStorage.setItem(this.storageKey, JSON.stringify(properties));
  }

  async createProperty(propertyData) {
    try {
      const properties = this._getAllProperties();
      
      const newProperty = {
        id: this._generateId(),
        title: propertyData.title || '',
        description: propertyData.description || '',
        type: propertyData.type || 'apartment',
        category: propertyData.category || 'rent',
        price: propertyData.price ? Number(propertyData.price) : null,
        rentPrice: propertyData.rentPrice ? Number(propertyData.rentPrice) : null,
        area: propertyData.area ? Number(propertyData.area) : 0,
        rooms: propertyData.rooms ? Number(propertyData.rooms) : 1,
        address: propertyData.address || '',
        coordinates: propertyData.coordinates || null,
        amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : [],
        images: Array.isArray(propertyData.images) ? propertyData.images : [],
        status: 'active',
        ownerId: propertyData.ownerId || 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (!newProperty.title) {
        throw new Error('Название объекта обязательно');
      }
      if (!newProperty.address) {
        throw new Error('Адрес объекта обязателен');
      }

      properties.push(newProperty);
      this._saveProperties(properties);

      console.log('✅ Объект создан:', newProperty);

      return {
        success: true,
        data: newProperty,
        message: 'Объект недвижимости успешно создан'
      };

    } catch (error) {
      console.error('Ошибка создания объекта:', error);
      throw error;
    }
  }

  async getPropertyById(id) {
    try {
      const properties = this._getAllProperties();
      const property = properties.find(prop => prop.id === parseInt(id));

      if (!property) {
        throw new Error(`Объект с ID ${id} не найден`);
      }

      return {
        success: true,
        data: property
      };

    } catch (error) {
      console.error('Ошибка получения объекта:', error);
      throw error;
    }
  }

  async getAllProperties(filters = {}) {
    try {
      let properties = this._getAllProperties();

      if (filters.includeInactive !== true && filters.includeInactive !== 'true') {
        properties = properties.filter(prop => prop.status === 'active');
      }

      if (filters.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        properties = properties.filter(prop => types.includes(prop.type));
      }

      if (filters.category) {
        properties = properties.filter(prop => prop.category === filters.category);
      }

      if (filters.rooms) {
        properties = properties.filter(prop => prop.rooms === filters.rooms);
      }

      if (filters.minPrice) {
        properties = properties.filter(prop => prop.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        properties = properties.filter(prop => prop.price <= Number(filters.maxPrice));
      }

      if (filters.minRentPrice) {
        properties = properties.filter(prop => prop.rentPrice >= Number(filters.minRentPrice));
      }
      if (filters.maxRentPrice) {
        properties = properties.filter(prop => prop.rentPrice <= Number(filters.maxRentPrice));
      }

      if (filters.minArea) {
        properties = properties.filter(prop => prop.area >= Number(filters.minArea));
      }
      if (filters.maxArea) {
        properties = properties.filter(prop => prop.area <= Number(filters.maxArea));
      }

      if (filters.ownerId) {
        properties = properties.filter(prop => prop.ownerId === filters.ownerId);
      }

      if (filters.sortBy) {
        properties.sort((a, b) => {
          if (filters.sortOrder === 'desc') {
            return b[filters.sortBy] - a[filters.sortBy];
          }
          return a[filters.sortBy] - b[filters.sortBy];
        });
      }

      const page = Number(filters.page) || 1;
      const limit = Number(filters.limit) || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedProperties = properties.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedProperties,
        pagination: {
          page,
          limit,
          total: properties.length,
          totalPages: Math.ceil(properties.length / limit)
        }
      };

    } catch (error) {
      console.error('Ошибка получения объектов:', error);
      throw error;
    }
  }

  async updateProperty(id, propertyData) {
    try {
      const properties = this._getAllProperties();
      const propertyIndex = properties.findIndex(prop => prop.id === parseInt(id));

      if (propertyIndex === -1) {
        throw new Error(`Объект с ID ${id} не найден`);
      }

      const updatedProperty = {
        ...properties[propertyIndex],
        ...propertyData,
        updatedAt: new Date().toISOString()
      };

      if (propertyData.price !== undefined) {
        updatedProperty.price = propertyData.price ? Number(propertyData.price) : null;
      }
      if (propertyData.rentPrice !== undefined) {
        updatedProperty.rentPrice = propertyData.rentPrice ? Number(propertyData.rentPrice) : null;
      }
      if (propertyData.area !== undefined) {
        updatedProperty.area = Number(propertyData.area);
      }
      if (propertyData.rooms !== undefined) {
        updatedProperty.rooms = Number(propertyData.rooms);
      }

      properties[propertyIndex] = updatedProperty;
      this._saveProperties(properties);

      console.log('✅ Объект обновлен:', updatedProperty);

      return {
        success: true,
        data: updatedProperty,
        message: 'Объект недвижимости успешно обновлен'
      };

    } catch (error) {
      console.error('Ошибка обновления объекта:', error);
      throw error;
    }
  }

  async deleteProperty(id) {
    try {
      return await this.updateProperty(id, { status: 'inactive' });
    } catch (error) {
      console.error('Ошибка удаления объекта:', error);
      throw error;
    }
  }

  async destroyProperty(id) {
    try {
      const properties = this._getAllProperties();
      const propertyIndex = properties.findIndex(prop => prop.id === parseInt(id));

      if (propertyIndex === -1) {
        throw new Error(`Объект с ID ${id} не найден`);
      }

      const deletedProperty = properties.splice(propertyIndex, 1)[0];
      this._saveProperties(properties);

      console.log('✅ Объект полностью удален:', deletedProperty);

      return {
        success: true,
        message: 'Объект недвижимости полностью удален',
        data: deletedProperty
      };

    } catch (error) {
      console.error('Ошибка полного удаления объекта:', error);
      throw error;
    }
  }

  async changePropertyStatus(id, status) {
    try {
      if (!['active', 'inactive', 'sold', 'rented'].includes(status)) {
        throw new Error('Недопустимый статус');
      }

      return await this.updateProperty(id, { status });
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      throw error;
    }
  }

  async restoreProperty(id) {
    try {
      return await this.changePropertyStatus(id, 'active');
    } catch (error) {
      console.error('Ошибка восстановления объекта:', error);
      throw error;
    }
  }

  async getPropertiesByOwner(ownerId, options = {}) {
    try {
      const filters = {
        ownerId,
        ...options
      };
      return await this.getAllProperties(filters);
    } catch (error) {
      console.error('Ошибка получения объектов владельца:', error);
      throw error;
    }
  }

  async searchProperties(filters = {}) {
    try {
      return await this.getAllProperties(filters);
    } catch (error) {
      console.error('Ошибка поиска объектов:', error);
      throw error;
    }
  }

  async getAvailableForRent(options = {}) {
    try {
      const filters = {
        category: 'rent',
        ...options
      };
      return await this.getAllProperties(filters);
    } catch (error) {
      console.error('Ошибка получения объектов для аренды:', error);
      throw error;
    }
  }

  async getAvailableForSale(options = {}) {
    try {
      const filters = {
        category: 'sale',
        ...options
      };
      return await this.getAllProperties(filters);
    } catch (error) {
      console.error('Ошибка получения объектов для продажи:', error);
      throw error;
    }
  }

  async getPropertiesStats(ownerId = null) {
    try {
      let properties = this._getAllProperties();

      if (ownerId) {
        properties = properties.filter(prop => prop.ownerId === ownerId);
      }

      const total = properties.length;
      const active = properties.filter(prop => prop.status === 'active').length;
      const inactive = properties.filter(prop => prop.status === 'inactive').length;
      const sold = properties.filter(prop => prop.status === 'sold').length;
      const rented = properties.filter(prop => prop.status === 'rented').length;

      const byType = properties.reduce((acc, prop) => {
        acc[prop.type] = (acc[prop.type] || 0) + 1;
        return acc;
      }, {});

      const byCategory = properties.reduce((acc, prop) => {
        acc[prop.category] = (acc[prop.category] || 0) + 1;
        return acc;
      }, {});

      const totalValue = properties.reduce((sum, prop) => sum + (prop.price || 0), 0);
      const totalRentValue = properties.reduce((sum, prop) => sum + (prop.rentPrice || 0), 0);

      return {
        success: true,
        data: {
          total,
          active,
          inactive,
          sold,
          rented,
          byType,
          byCategory,
          totalValue,
          totalRentValue,
          averagePrice: total > 0 ? Math.round(totalValue / total) : 0,
          averageRentPrice: total > 0 ? Math.round(totalRentValue / total) : 0
        }
      };

    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  async createSampleProperties() {
    const sampleProperties = [
      {
        title: 'Просторная 3-комнатная квартира в центре',
        description: 'Светлая и уютная квартира с современным ремонтом. Панорамные окна, вид на город.',
        type: 'apartment',
        category: 'rent',
        price: null,
        rentPrice: 45000,
        area: 85,
        rooms: 3,
        address: 'Москва, ул. Тверская, д. 25',
        coordinates: { lat: 55.7558, lng: 37.6173 },
        amenities: ['wifi', 'parking', 'elevator', 'furniture'],
        images: ['https://via.placeholder.com/600x400/007bff/ffffff?text=Квартира+1'],
        ownerId: 1
      },
      {
        title: 'Современный офис в бизнес-центре',
        description: 'Офисное помещение класса А с отделкой под ключ.',
        type: 'commercial',
        category: 'sale',
        price: 25000000,
        rentPrice: null,
        area: 120,
        rooms: 1,
        address: 'Москва, Пресненская наб., д. 12',
        coordinates: { lat: 55.7476, lng: 37.5394 },
        amenities: ['wifi', 'parking', 'security', 'conference'],
        images: ['https://via.placeholder.com/600x400/28a745/ffffff?text=Офис+1'],
        ownerId: 1
      },
      {
        title: 'Уютная 1-комнатная квартира',
        description: 'Компактная квартира для молодой семьи или одного человека.',
        type: 'apartment',
        category: 'rent',
        price: null,
        rentPrice: 28000,
        area: 45,
        rooms: 1,
        address: 'Москва, ул. Ленина, д. 15',
        coordinates: { lat: 55.7517, lng: 37.6178 },
        amenities: ['wifi', 'furniture'],
        images: ['https://via.placeholder.com/600x400/dc3545/ffffff?text=Квартира+2'],
        ownerId: 1
      }
    ];

    const results = [];
    for (const propertyData of sampleProperties) {
      try {
        const result = await this.createProperty(propertyData);
        results.push(result);
      } catch (error) {
        console.error('Ошибка создания тестового объекта:', error);
      }
    }

    return {
      success: true,
      message: `Создано ${results.length} тестовых объектов`,
      data: results
    };
  }
}