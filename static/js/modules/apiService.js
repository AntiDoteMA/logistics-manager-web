class ApiService {
    constructor(baseUrl, headers) {
        this.apiBaseUrl = baseUrl;
        this.headers = headers;
    }

    async getCurrentUser() {
        try {
            const response = await fetch('/ajax/auth/me', {
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
        return null;
    }

    async loadClientsData() {
        try {
            const response = await fetch('/ajax/clients/list', {
                method: 'GET',
                headers: this.headers
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.error || 'Failed to load clients');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            throw error;
        }
    }

    async loadVendorsData() {
        try {
            const response = await fetch('/ajax/vendors/list', {
                method: 'GET',
                headers: this.headers
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data;
                } else {
                    throw new Error(result.error || 'Failed to load vendors');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading vendors:', error);
            throw error;
        }
    }

    async loadOperationsData() {
        try {
            const response = await fetch('/ajax/operations', {
                method: 'GET',
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.data || [];
            } else if (response.status === 401) {
                throw new Error('Please log in to view operations');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading operations:', error);
            throw error;
        }
    }

    async loadExpensesData() {
        try {
            const response = await fetch('/ajax/expenses', {
                method: 'GET',
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.data || [];
            } else {
                console.warn('Expenses endpoint returned:', response.status, response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Error loading expenses:', error);
            return [];
        }
    }
}

// Make ApiService available globally and as ES6 export
window.ApiService = ApiService;
export default ApiService;