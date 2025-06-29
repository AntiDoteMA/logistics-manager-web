class OperationsApiService {
    constructor(baseUrl, headers) {
        this.apiBaseUrl = baseUrl;
        this.headers = headers;
    }

    async loadOperations() {
        try {
            const response = await fetch(this.apiBaseUrl, {
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

    async saveOperation(operationData, isEdit, id = null) {
        try {
            const url = id ? `${this.apiBaseUrl}/${id}` : this.apiBaseUrl;
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: this.headers,
                body: JSON.stringify(operationData),
                credentials: 'same-origin'
            });

            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving operation:', error);
            throw error;
        }
    }

    async deleteOperation(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}`, {
                method: 'DELETE',
                headers: this.headers,
                credentials: 'same-origin'
            });

            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete operation');
            }
        } catch (error) {
            console.error('Error deleting operation:', error);
            throw error;
        }
    }

    async confirmOperation(id) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}/confirm`, {
                method: 'PUT',
                headers: this.headers,
                credentials: 'same-origin'
            });

            if (response.ok) {
                return await response.json();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to confirm operation');
            }
        } catch (error) {
            console.error('Error confirming operation:', error);
            throw error;
        }
    }

    async generateOperationNumber() {
        try {
            const response = await fetch('/ajax/operations/generate-id', {
                headers: this.headers,
                credentials: 'same-origin'
            });
            
            if (response.ok) {
                const result = await response.json();
                return result.operation_num;
            }
        } catch (error) {
            console.error('Error generating operation number:', error);
            throw error;
        }
    }
}

export default OperationsApiService;
