import { 
  createProperty,
  getPropertyById,
  getAllProperties,
  updateProperty,
  deleteProperty,
  destroyProperty,
  changePropertyStatus,
  getPropertiesByOwner,
  searchProperties,
  getAvailableForRent,
  getAvailableForSale,
  restoreProperty,
  getPropertiesStats
} from '../../controllers/objectController';
import { authenticate } from '../../middlewares/authMiddleware';

class PropertyApiService {
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
      console.error('Property API Error:', error);
      
      if (error instanceof Error && error.message.includes('токен')) {
        this.clearToken();
      }
      
      throw error;
    }
  }

  async createProperty(propertyData: any) {
    const processedData = {
      ...propertyData,
      price: propertyData.price ? Number(propertyData.price) : propertyData.price,
      rentPrice: propertyData.rentPrice ? Number(propertyData.rentPrice) : propertyData.rentPrice,
      area: propertyData.area ? Number(propertyData.area) : propertyData.area,
      rooms: propertyData.rooms ? Number(propertyData.rooms) : propertyData.rooms,
      ownerId: propertyData.ownerId ? Number(propertyData.ownerId) : propertyData.ownerId
    };
    
    return this.makeRequest(createProperty, processedData, true);
  }

  async getPropertyById(id: string) {
    const numericId = Number(id);
    return this.makeRequest(getPropertyById, { id: numericId }, false);
  }

  async getAllProperties(filters?: any) {
    // Преобразование числовых фильтров
    const processedFilters = filters ? {
      ...filters,
      page: filters.page ? Number(filters.page) : filters.page,
      limit: filters.limit ? Number(filters.limit) : filters.limit
    } : filters;
    
    return this.makeRequest(getAllProperties, processedFilters, false);
  }

  async updateProperty(id: string, propertyData: any) {
    const numericId = Number(id);
    // Преобразование строк в числа
    const processedData = {
      ...propertyData,
      price: propertyData.price ? Number(propertyData.price) : propertyData.price,
      rentPrice: propertyData.rentPrice ? Number(propertyData.rentPrice) : propertyData.rentPrice,
      area: propertyData.area ? Number(propertyData.area) : propertyData.area,
      rooms: propertyData.rooms ? Number(propertyData.rooms) : propertyData.rooms
    };
    
    return this.makeRequest(updateProperty, { id: numericId, ...processedData }, true);
  }

  async deleteProperty(id: string) {
    const numericId = Number(id);
    return this.makeRequest(deleteProperty, { id: numericId }, true);
  }

  async destroyProperty(id: string) {
    const numericId = Number(id);
    return this.makeRequest(destroyProperty, { id: numericId }, true);
  }

  async changePropertyStatus(id: string, status: string) {
    const numericId = Number(id);
    return this.makeRequest(changePropertyStatus, { id: numericId, status }, true);
  }

  async getPropertiesByOwner(ownerId: string, options?: any) {
    const numericOwnerId = Number(ownerId);
    // Преобразование числовых опций
    const processedOptions = options ? {
      ...options,
      page: options.page ? Number(options.page) : options.page,
      limit: options.limit ? Number(options.limit) : options.limit
    } : options;
    
    return this.makeRequest(getPropertiesByOwner, { ownerId: numericOwnerId, ...processedOptions }, true);
  }

  async searchProperties(filters: any) {
    const processedFilters = {
      ...filters,
      minPrice: filters.minPrice ? Number(filters.minPrice) : filters.minPrice,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : filters.maxPrice,
      minRentPrice: filters.minRentPrice ? Number(filters.minRentPrice) : filters.minRentPrice,
      maxRentPrice: filters.maxRentPrice ? Number(filters.maxRentPrice) : filters.maxRentPrice,
      minArea: filters.minArea ? Number(filters.minArea) : filters.minArea,
      maxArea: filters.maxArea ? Number(filters.maxArea) : filters.maxArea,
      rooms: filters.rooms ? Number(filters.rooms) : filters.rooms,
      page: filters.page ? Number(filters.page) : filters.page,
      limit: filters.limit ? Number(filters.limit) : filters.limit
    };
    
    return this.makeRequest(searchProperties, processedFilters, false);
  }

  async getAvailableForRent(options?: any) {
    const processedOptions = options ? {
      ...options,
      page: options.page ? Number(options.page) : options.page,
      limit: options.limit ? Number(options.limit) : options.limit
    } : options;
    
    return this.makeRequest(getAvailableForRent, processedOptions, false);
  }

  async getAvailableForSale(options?: any) {
    const processedOptions = options ? {
      ...options,
      page: options.page ? Number(options.page) : options.page,
      limit: options.limit ? Number(options.limit) : options.limit
    } : options;
    
    return this.makeRequest(getAvailableForSale, processedOptions, false);
  }

  async restoreProperty(id: string) {
    const numericId = Number(id);
    return this.makeRequest(restoreProperty, { id: numericId }, true);
  }

  async getPropertiesStats(ownerId?: string) {
    const numericOwnerId = ownerId ? Number(ownerId) : undefined;
    return this.makeRequest(getPropertiesStats, { ownerId: numericOwnerId }, true);
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

export const propertyApiService = new PropertyApiService();