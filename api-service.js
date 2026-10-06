// ===========================
// API Service - Backend Connection
// ===========================

// Override by defining window.API_BASE_URL before this script loads
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('access_token');
    }

    // Get headers with authentication
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    // Set authentication tokens
    setTokens(access, refresh) {
        this.token = access;
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    }

    // Clear tokens on logout
    clearTokens() {
        this.token = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.token;
    }

    // Refresh token
    async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.access, refresh);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    // Generic API request with auto retry on token expiry
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            let response = await fetch(url, config);

            // If unauthorized, try refreshing token
            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    config.headers = this.getHeaders();
                    response = await fetch(url, config);
                }
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'حدث خطأ في الطلب');
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // ===========================
    // Authentication API
    // ===========================

    async register(userData) {
        const data = await this.request('/auth/register/', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
        this.setTokens(data.tokens.access, data.tokens.refresh);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        this.setTokens(data.tokens.access, data.tokens.refresh);
        return data;
    }

    async logout() {
        const refresh = localStorage.getItem('refresh_token');
        try {
            await this.request('/auth/logout/', {
                method: 'POST',
                body: JSON.stringify({ refresh })
            });
        } catch (e) {
            // Ignore errors on logout
        }
        this.clearTokens();
    }

    async getCurrentUser() {
        return await this.request('/auth/me/');
    }

    // ===========================
    // Tasks API
    // ===========================

    async getTasks() {
        return await this.request('/tasks/');
    }

    async createTask(taskData) {
        return await this.request('/tasks/', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(taskId, taskData) {
        return await this.request(`/tasks/${taskId}/`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }

    async deleteTask(taskId) {
        return await this.request(`/tasks/${taskId}/`, {
            method: 'DELETE'
        });
    }

    async toggleTask(taskId) {
        return await this.request(`/tasks/${taskId}/toggle/`, {
            method: 'PATCH'
        });
    }

    async getTaskProgress() {
        return await this.request('/tasks/progress/');
    }

    // ===========================
    // Notifications API
    // ===========================

    async getNotifications() {
        return await this.request('/notifications/');
    }

    async markNotificationRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/mark_read/`, {
            method: 'PATCH'
        });
    }

    async markAllNotificationsRead() {
        return await this.request('/notifications/mark_all_read/', {
            method: 'PATCH'
        });
    }

    async getUnreadCount() {
        return await this.request('/notifications/unread_count/');
    }

    async deleteNotification(notificationId) {
        return await this.request(`/notifications/${notificationId}/`, {
            method: 'DELETE'
        });
    }

    // ===========================
    // Activities API
    // ===========================

    async getActivities() {
        return await this.request('/activities/');
    }

    // ===========================
    // Statistics API
    // ===========================

    async getDashboardStats() {
        return await this.request('/statistics/dashboard/');
    }

    async getChartData(period = 'week') {
        return await this.request(`/statistics/chart/?period=${encodeURIComponent(period)}`);
    }

}

// Create global instance
const api = new ApiService();

// Export for use in app.js
window.api = api;
