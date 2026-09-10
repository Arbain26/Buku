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
    const res = await api.get('/books/categories');
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

  async createBook(formData) {
    const res = await api.post('/books', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateBook(id, formData) {
    const res = await api.put(`/books/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
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
    const res = await api.post('/mitra/inventory', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateInventory(id, data) {
    const res = await api.put(`/mitra/inventory/${id}`, data);
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

  async verifyMitra(id, status) {
    const res = await api.put(`/admin/mitra/${id}/verify`, { status });
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
};
