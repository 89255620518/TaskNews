import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from './apiService';

export const ApiRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleApiRoutes = async () => {
      const path = location.pathname;
      
      if (path.startsWith('/api/')) {
        try {
          let result: any;

          const isProtectedRoute = ![
            '/api/register',
            '/api/login', 
            '/api/refresh'
          ].includes(path) && !path.match(/^\/api\/register|login|refresh/);

          if (!isProtectedRoute) {
            switch (path) {
              case '/api/register':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const userData = Object.fromEntries(params);
                  result = await apiService.register(userData);
                }
                break;

              case '/api/login':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const credentials = Object.fromEntries(params);
                  result = await apiService.login(credentials);
                }
                break;

              case '/api/refresh':
                result = await apiService.refresh();
                break;
            }
          } 
          else {
            const authCheck = await apiService.checkAuth();
            if (authCheck.error) {
              sessionStorage.setItem('apiError', JSON.stringify({
                status: 401,
                message: 'Требуется аутентификация'
              }));
              navigate('/login');
              return;
            }

            switch (path) {
              case '/api/profile':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const userData = Object.fromEntries(params);
                  result = await apiService.updateProfile(userData);
                } else {
                  result = await apiService.getCurrentUser();
                }
                break;

              case '/api/logout':
                result = await apiService.logout();
                navigate('/login');
                break;

              case '/api/users':
                if (location.search) {
                  const params = new URLSearchParams(location.search);
                  const userData = Object.fromEntries(params);
                  result = await apiService.createUser(userData);
                } else {
                  result = await apiService.getAllUsers();
                }
                break;

              default:
                if (path.match(/^\/api\/users\/\d+$/)) {
                  const id = path.split('/')[3];
                  
                  if (path.endsWith('/role')) {
                    const params = new URLSearchParams(location.search);
                    const role = params.get('role');
                    if (role) {
                      result = await apiService.updateUserRole(id, role);
                    }
                  } else if (location.search) {
                    const params = new URLSearchParams(location.search);
                    const userData = Object.fromEntries(params);
                  } else {
                    result = await apiService.getUserById(id);
                  }
                }
                
                if (path.match(/^\/api\/users\/\d+$/) && location.search.includes('_method=delete')) {
                  const id = path.split('/')[3];
                  result = await apiService.deleteUser(id);
                }
            }
          }

          if (result) {
            sessionStorage.setItem('apiResult', JSON.stringify(result));
          }

        } catch (error) {
          console.error('API Route error:', error);
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