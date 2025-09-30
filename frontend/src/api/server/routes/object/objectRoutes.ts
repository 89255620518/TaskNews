import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { propertyApiService } from './objectService';

export const PropertyRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleApiRoutes = async () => {
      const path = location.pathname;
      
      if (path.startsWith('/api/properties')) {
        try {
          let result: any;

          const isProtectedRoute = ![
            '/api/properties',
            '/api/properties/search',
            '/api/properties/rent',
            '/api/properties/sale'
          ].includes(path) && !path.match(/^\/api\/properties\/(\d+)$/);

          if (!isProtectedRoute) {
            switch (path) {
              case '/api/properties':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const filters = Object.fromEntries(params);
                  result = await propertyApiService.getAllProperties(filters);
                } else {
                  result = await propertyApiService.getAllProperties();
                }
                break;

              case '/api/properties/search':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const filters: any = Object.fromEntries(params);
                  
                  // Преобразование массивов
                  if (filters.type && typeof filters.type === 'string') filters.type = filters.type.split(',');
                  if (filters.amenities && typeof filters.amenities === 'string') filters.amenities = filters.amenities.split(',');
                  
                  result = await propertyApiService.searchProperties(filters);
                }
                break;

              case '/api/properties/rent':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const options: any = Object.fromEntries(params);
                  result = await propertyApiService.getAvailableForRent(options);
                } else {
                  result = await propertyApiService.getAvailableForRent();
                }
                break;

              case '/api/properties/sale':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const options: any = Object.fromEntries(params);
                  result = await propertyApiService.getAvailableForSale(options);
                } else {
                  result = await propertyApiService.getAvailableForSale();
                }
                break;

              default:
                if (path.match(/^\/api\/properties\/\d+$/)) {
                  const id = path.split('/')[3];
                  result = await propertyApiService.getPropertyById(id);
                }
            }
          } 
          else {
            const authCheck = await propertyApiService.checkAuth();
            if (authCheck.error) {
              sessionStorage.setItem('apiError', JSON.stringify({
                status: 401,
                message: 'Требуется аутентификация'
              }));
              navigate('/login');
              return;
            }

            switch (path) {
              case '/api/properties':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const propertyData: any = Object.fromEntries(params);
                  
                  // Преобразование массивов и JSON
                  if (propertyData.amenities && typeof propertyData.amenities === 'string') {
                    propertyData.amenities = propertyData.amenities.split(',');
                  }
                  if (propertyData.images && typeof propertyData.images === 'string') {
                    propertyData.images = propertyData.images.split(',');
                  }
                  if (propertyData.coordinates && typeof propertyData.coordinates === 'string') {
                    try {
                      propertyData.coordinates = JSON.parse(propertyData.coordinates);
                    } catch (e) {
                      propertyData.coordinates = undefined;
                    }
                  }
                  
                  result = await propertyApiService.createProperty(propertyData);
                }
                break;

              case '/api/properties/stats':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const statsData = Object.fromEntries(params);
                  result = await propertyApiService.getPropertiesStats(statsData.ownerId);
                } else {
                  result = await propertyApiService.getPropertiesStats();
                }
                break;

              case '/api/properties/owner':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const ownerData: any = Object.fromEntries(params);
                  
                  if (ownerData.ownerId) {
                    if (ownerData.includeInactive) ownerData.includeInactive = ownerData.includeInactive === 'true';
                    
                    result = await propertyApiService.getPropertiesByOwner(ownerData.ownerId, ownerData);
                  }
                }
                break;

              default:
                // Обработка маршрутов с ID
                if (path.match(/^\/api\/properties\/\d+/)) {
                  const id = path.split('/')[3];
                  const subPath = path.split('/')[4];

                  switch (subPath) {
                    case 'status':
                      if (location.search) {
                        const params = new URLSearchParams(location.search);
                        const status = params.get('status');
                        if (status) {
                          result = await propertyApiService.changePropertyStatus(id, status);
                        }
                      }
                      break;

                    case 'restore':
                      result = await propertyApiService.restoreProperty(id);
                      break;

                    case 'destroy':
                      result = await propertyApiService.destroyProperty(id);
                      break;

                    default:
                      if (location.search) {
                        const params = new URLSearchParams(location.search);
                        const propertyData: any = Object.fromEntries(params);
                        
                        // Преобразование массивов и JSON
                        if (propertyData.amenities && typeof propertyData.amenities === 'string') {
                          propertyData.amenities = propertyData.amenities.split(',');
                        }
                        if (propertyData.images && typeof propertyData.images === 'string') {
                          propertyData.images = propertyData.images.split(',');
                        }
                        if (propertyData.coordinates && typeof propertyData.coordinates === 'string') {
                          try {
                            propertyData.coordinates = JSON.parse(propertyData.coordinates);
                          } catch (e) {
                            propertyData.coordinates = undefined;
                          }
                        }
                        
                        result = await propertyApiService.updateProperty(id, propertyData);
                      } else if (location.search.includes('_method=delete')) {
                        result = await propertyApiService.deleteProperty(id);
                      } else {
                        result = await propertyApiService.getPropertyById(id);
                      }
                  }
                }
            }
          }

          if (result) {
            sessionStorage.setItem('apiResult', JSON.stringify(result));
          }

        } catch (error) {
          console.error('Property API Route error:', error);
          sessionStorage.setItem('apiError', JSON.stringify({
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 500
          }));
        }
      }
    };

    handleApiRoutes();
  }, [location, navigate]);

  return null;
};