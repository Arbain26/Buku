import api from './api';

export const bookService = {
  async getBooks(params) {
    const res = await api.get('/books', { params });
    return res.data;
  },

  async getBookById(id) {
    const res = await api.get(`/books/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },

  async toggleFavorite(bookId) {
    const res = await api.post(`/books/${bookId}/favorite`);
    return res.data;
  },

  async addReview(bookId, data) {
    const res = await api.post(`/books/${bookId}/reviews`, data);
    return res.data;
  },

  async createBook(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post('/books', data, config);
    return res.data;
  },

  async updateBook(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.put(`/books/${id}`, data, config);
    return res.data;
  },

  async deleteBook(id) {
    const res = await api.delete(`/books/${id}`);
    return res.data;
  },
};

export const storeService = {
  async getStores(params) {
    const res = await api.get('/stores', { params });
    return res.data;
  },

  async getStoreById(id, params) {
    const res = await api.get(`/stores/${id}`, { params });
    return res.data;
  },
};

export const libraryService = {
  async getLibraries(params) {
    const res = await api.get('/libraries', { params });
    return res.data;
  },

  async getLibraryById(id, params) {
    const res = await api.get(`/libraries/${id}`, { params });
    return res.data;
  },

  async requestBorrow(data) {
    const res = await api.post('/libraries/borrow', data);
    return res.data;
  },
};

export const communityService = {
  async getCommunities(params) {
    const res = await api.get('/communities', { params });
    return res.data;
  },

  async getCommunityById(id) {
    const res = await api.get(`/communities/${id}`);
    return res.data;
  },

  async toggleJoin(id) {
    const res = await api.post(`/communities/${id}/join`);
    return res.data;
  },
};

export const eventService = {
  async getEvents(params) {
    const res = await api.get('/events', { params });
    return res.data;
  },

  async getEventById(id) {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  async registerEvent(id) {
    const res = await api.post(`/events/${id}/register`);
    return res.data;
  },

  async createEvent(formData) {
    const res = await api.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async deleteEvent(id) {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  },
};

export const articleService = {
  async getArticles(params) {
    const res = await api.get('/articles', { params });
    return res.data;
  },

  async getArticleById(id) {
    const res = await api.get(`/articles/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/articles/categories');
    return res.data;
  },

  async createArticle(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post('/articles', data, config);
    return res.data;
  },

  async updateArticle(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.put(`/articles/${id}`, data, config);
    return res.data;
  },

  async deleteArticle(id) {
    const res = await api.delete(`/articles/${id}`);
    return res.data;
  },
};

export const searchService = {
  async universalSearch(params) {
    const res = await api.get('/search', { params });
    return res.data;
  },
};

export const userService = {
  async getDashboard() {
    const res = await api.get('/user/dashboard');
    return res.data;
  },

  async completeMission(missionId) {
    const res = await api.post(`/user/missions/${missionId}/complete`);
    return res.data;
  },
};

export const mitraService = {
  async getDashboard() {
    const res = await api.get('/mitra/dashboard');
    return res.data;
  },

  async addInventory(formData) {
    const isFormData = typeof FormData !== 'undefined' && formData instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post('/mitra/inventory', formData, config);
    return res.data;
  },

  async updateInventory(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.put(`/mitra/inventory/${id}`, data, config);
    return res.data;
  },

  async deleteInventory(id) {
    const res = await api.delete(`/mitra/inventory/${id}`);
    return res.data;
  },

  async updateBorrowingStatus(id, status) {
    const res = await api.put(`/mitra/borrowings/${id}/status`, { status });
    return res.data;
  },

  async getProfile() {
    const res = await api.get('/mitra/profile');
    return res.data;
  },

  async updateProfile(formData) {
    const res = await api.put('/mitra/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const orderService = {
  async createOrder(data) {
    const res = await api.post('/orders', data);
    return res.data;
  },

  async getOrders(params) {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async contactWhatsapp(id) {
    const res = await api.post(`/orders/${id}/contact-whatsapp`);
    return res.data;
  },

  async updateOrderStatus(id, status) {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },

  async deleteOrder(id) {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },
};

export const borrowingService = {
  async getBorrowings(params) {
    const res = await api.get('/borrowings', { params });
    return res.data;
  },

  async getBorrowingById(id) {
    const res = await api.get(`/borrowings/${id}`);
    return res.data;
  },

  async createBorrowing(data) {
    const res = await api.post('/borrowings', data);
    return res.data;
  },

  async approveBorrowing(id) {
    const res = await api.put(`/borrowings/${id}/approve`);
    return res.data;
  },

  async rejectBorrowing(id, notes) {
    const res = await api.put(`/borrowings/${id}/reject`, { notes });
    return res.data;
  },

  async returnBorrowing(id) {
    const res = await api.put(`/borrowings/${id}/return`);
    return res.data;
  },

  async updateBorrowingStatus(id, status, notes) {
    const res = await api.put(`/borrowings/${id}/status`, { status, notes });
    return res.data;
  },

  async deleteBorrowing(id) {
    const res = await api.delete(`/borrowings/${id}`);
    return res.data;
  },
};

export const favoriteService = {
  async getUserFavorites(params) {
    const res = await api.get('/favorites', { params });
    return res.data;
  },

  async toggleBookFavorite(bookId) {
    const res = await api.post(`/favorites/books/${bookId}`);
    return res.data;
  },

  async toggleStoreFavorite(storeId) {
    const res = await api.post(`/favorites/stores/${storeId}`);
    return res.data;
  },

  async toggleLibraryFavorite(libraryId) {
    const res = await api.post(`/favorites/libraries/${libraryId}`);
    return res.data;
  },

  async toggleCommunityFavorite(communityId) {
    const res = await api.post(`/favorites/communities/${communityId}`);
    return res.data;
  },

  async toggleEventFavorite(eventId) {
    const res = await api.post(`/favorites/events/${eventId}`);
    return res.data;
  },

  async toggleArticleFavorite(articleId) {
    const res = await api.post(`/favorites/articles/${articleId}`);
    return res.data;
  },
};

export const notificationService = {
  async getNotifications(params) {
    const res = await api.get('/notifications', { params });
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};

export const locationService = {
  async getLocations(params) {
    const res = await api.get('/locations', { params });
    return res.data;
  },

  async getNearby(params) {
    const res = await api.get('/locations/nearby', { params });
    return res.data;
  },
};

export const adminService = {
  async getDashboard() {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getPendingMitra() {
    const res = await api.get('/admin/pending-mitra');
    return res.data;
  },

  async getMitraList(params) {
    const res = await api.get('/admin/mitra', { params });
    return res.data;
  },

  async verifyMitra(id, status, reason = null) {
    const res = await api.put(`/admin/mitra/${id}/verify`, { status, reason });
    return res.data;
  },

  async getLiteracyStats() {
    const res = await api.get('/admin/literacy-stats');
    return res.data;
  },

  async getAllUsers(params) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async updateMitra(id, data) {
    const res = await api.put(`/admin/mitra/${id}`, data);
    return res.data;
  },

  async deleteMitra(id) {
    const res = await api.delete(`/admin/mitra/${id}`);
    return res.data;
  },

  async getBooks(params) {
    const res = await api.get('/admin/books', { params });
    return res.data;
  },

  async getEvents(params) {
    const res = await api.get('/admin/events', { params });
    return res.data;
  },

  async getArticles(params) {
    const res = await api.get('/admin/articles', { params });
    return res.data;
  },

  async getReports() {
    const res = await api.get('/admin/reports');
    return res.data;
  },

  async getOrders(params) {
    const res = await api.get('/orders', { params });
    return res.data;
  },

  async updateOrderStatus(id, status) {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },

  async deleteOrder(id) {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  },

  async getBorrowings(params) {
    const res = await api.get('/borrowings', { params });
    return res.data;
  },

  async updateBorrowingStatus(id, status, notes) {
    const res = await api.put(`/borrowings/${id}/status`, { status, notes });
    return res.data;
  },

  async deleteBorrowing(id) {
    const res = await api.delete(`/borrowings/${id}`);
    return res.data;
  },

  async createBook(data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.post('/books', data, config);
    return res.data;
  },

  async updateBook(id, data) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    const res = await api.put(`/books/${id}`, data, config);
    return res.data;
  },

  async deleteBook(id) {
    const res = await api.delete(`/books/${id}`);
    return res.data;
  },

  async getCategories() {
    const res = await api.get('/categories');
    return res.data;
  },

  async createArticle(data) {
    return articleService.createArticle(data);
  },

  async deleteArticle(id) {
    return articleService.deleteArticle(id);
  },

  async createEvent(data) {
    return eventService.createEvent(data);
  },

  async deleteEvent(id) {
    return eventService.deleteEvent(id);
  },
};


