import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const setAuthState = useCallback((newAccessToken, newRefreshToken, userData, authenticated) => {
        if (newAccessToken && authenticated && userData) {
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }
            setAccessToken(newAccessToken);
            setRefreshToken(newRefreshToken);
            setUser(userData);
            setUserRole(userData.role);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
            setUserRole(null);
            setIsAuthenticated(false);
        }
    }, []);

    const validateToken = useCallback(async (tokenToValidate) => {
        if (!tokenToValidate) return false;
        
        try {
            const response = await api.auth.getCurrentUser();
            console.log('Token validation response:', response);
            
            if (response && response.success) {
                const userData = response.data;
                const savedRefreshToken = localStorage.getItem('refreshToken');
                setAuthState(tokenToValidate, savedRefreshToken, userData, true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token validation error:', error);
            
            const savedRefreshToken = localStorage.getItem('refreshToken');
            if (savedRefreshToken) {
                try {
                    const refreshResponse = await api.auth.refresh();
                    if (refreshResponse && refreshResponse.success) {
                        const newAccessToken = refreshResponse.data.accessToken;
                        const newRefreshToken = refreshResponse.data.refreshToken;
                        
                        const userResponse = await api.auth.getCurrentUser();
                        if (userResponse && userResponse.success) {
                            setAuthState(newAccessToken, newRefreshToken, userResponse.data, true);
                            return true;
                        }
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                }
            }
            
            setAuthState(null, null, null, false);
            return false;
        }
    }, [setAuthState]);

    useEffect(() => {
        const initializeAuth = async () => {
            const savedAccessToken = localStorage.getItem('accessToken');
            console.log('Initializing auth with accessToken:', !!savedAccessToken);
            
            if (savedAccessToken && savedAccessToken !== 'null' && savedAccessToken !== 'undefined') {
                await validateToken(savedAccessToken);
            } else {
                setAuthState(null, null, null, false);
            }
            
            setIsLoading(false);
        };

        initializeAuth();
    }, [validateToken, setAuthState]);

    const login = async (credentials) => {
        try {
            const response = await api.auth.login(credentials);
            console.log('Login response:', response);
            
            if (response && response.success) {
                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;
                const userData = response.data.user;
                
                if (newAccessToken && userData) {
                    setAuthState(newAccessToken, newRefreshToken, userData, true);
                    return { success: true, data: response.data };
                }
            }
            
            return { 
                success: false, 
                error: response?.data?.message || 'Ошибка авторизации' 
            };
        } catch (error) {
            console.error('Login error:', error);
            setAuthState(null, null, null, false);
            return { 
                success: false, 
                error: error.message || 'Ошибка сети' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData) => {
        setIsLoading(true);
        try {
            const response = await api.auth.register(userData);
            console.log('Register response:', response);
            
            if (response && response.success) {
                return { success: true, data: response.data };
            }
            
            return { 
                success: false, 
                error: response?.data?.message || 'Ошибка регистрации' 
            };
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                error: error.message || 'Ошибка сети' 
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await api.auth.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAuthState(null, null, null, false);
            setIsLoading(false);
        }
    };

    const refreshAuthToken = async () => {
        try {
            const savedRefreshToken = localStorage.getItem('refreshToken');
            if (!savedRefreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await api.auth.refresh();
            
            if (response && response.success) {
                const newAccessToken = response.data.accessToken;
                const newRefreshToken = response.data.refreshToken;
                
                setAuthState(newAccessToken, newRefreshToken, user, true);
                return { success: true, accessToken: newAccessToken };
            }
            
            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Token refresh error:', error);
            setAuthState(null, null, null, false);
            throw error;
        }
    };

    const updateProfile = async (userData) => {
        try {
            const response = await api.auth.updateProfile(userData);

            console.log(response, 'repon')
            
            if (response && response.success) {
                const updatedUser = response.data.user || response.data;
                setUser(updatedUser);
                setUserRole(updatedUser.role);
                return { success: true, data: response.data };
            } else {
                return { 
                    success: false, 
                    error: response?.data?.message || 'Ошибка обновления' 
                };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { 
                success: false, 
                error: error.message || 'Ошибка сети' 
            };
        }
    };

    const hasRole = (role) => userRole === role;
    const hasAnyRole = (roles) => roles.includes(userRole);
    const isAdmin = () => userRole === 'admin';
    const isManager = () => userRole === 'manager';
    const isSupport = () => userRole === 'support';
 
    return (
        <AuthContext.Provider value={{ 
            token: accessToken,
            accessToken,
            refreshToken,
            user,
            userRole,
            login, 
            register,
            logout, 
            refreshAuthToken,
            updateProfile,
            isLoading,
            isAuthenticated,
            hasRole,
            hasAnyRole,
            isAdmin,
            isManager,
            isSupport
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};