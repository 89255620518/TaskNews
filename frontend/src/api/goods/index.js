export class GoodsAPI {
    constructor(httpClient) {
        this.api = httpClient;
        this.baseUrl = '/goods/';
    }

    // Основные CRUD операции для товаров
    getAll(params = {}) {
        return this.api.get(this.baseUrl, { params });
    }

    getById(id) {
        return this.api.get(`${this.baseUrl}${id}/`);
    }

    // Работа с избранным
    addFavorite(id, token) {
        return this.api.post(`${this.baseUrl}${id}/favorite/`, null, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    removeFavorite(id, token) {
        return this.api.delete(`${this.baseUrl}${id}/favorite/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    // Работа с корзиной
    addToCart(id, token, count = 1) {

        return this.api.post(
            `${this.baseUrl}${id}/shopping_cart/`,
            { count },
            {
                headers: {
                    'Authorization': `Token ${token}`
                }
            }
        );
    }

    updateCartItem(id, count, token) {
        const isKhinkali = [82, 174, 81, 83].includes(id);
        const minKhinkaliCount = 5;

        if (isKhinkali && count < minKhinkaliCount && count > 0) {
            return Promise.reject(new Error(`Минимальное количество хинкали - ${minKhinkaliCount} шт.`));
        }

        return this.api.patch(
            `${this.baseUrl}${id}/shopping_cart/`,
            { count },
            {
                headers: {
                    'Authorization': `Token ${token}`
                }
            }
        );
    }

    removeFromCart(id, token) {
        return this.api.delete(
            `${this.baseUrl}${id}/shopping_cart/`,
            {
                headers: {
                    'Authorization': `Token ${token}`
                }
            }
        );
    }

    getCart(token) {
        return this.api.get(`${this.baseUrl}basket/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    getCartItemCount(id, token) {
        return this.getCart(token)
            .then(response => {
                const item = response.data.items.find(item => item.id === id);
                return item ? item.quantity : 0;
            })
            .catch(() => 0);
    }

    getOrderHistory(token) {
        return this.api.get(`${this.baseUrl}order_history/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    // Бронирования
    getReservations(token) {
        return this.api.get('/reservations/', {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    getReservation(id, token) {
        return this.api.get(`/reservations/${id}/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    createReservation(data, token) {
        return this.api.post('/reservations/', data, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    updateReservation(id, data, token) {
        return this.api.put(`/reservations/${id}/`, data, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }

    deleteReservation(id, token) {
        return this.api.delete(`/reservations/${id}/`, {
            headers: {
                'Authorization': `Token ${token}`
            }
        });
    }
}