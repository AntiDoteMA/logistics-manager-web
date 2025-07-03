/**
 * Invoices API Service
 *
 * Handles all API requests related to invoices.
 * This module is responsible for communicating with the backend invoice endpoints.
 */
class InvoicesApiService {
    constructor() {
        this.baseUrl = '/ajax/invoices';
    }

    /**
     * Fetches all invoices from the server, with optional filters.
     * @param {Object} [filters={}] - The filter criteria.
     * @returns {Promise<Array>} A promise that resolves to an array of invoice objects.
     */
    async loadInvoices(filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const url = `${this.baseUrl}?${queryParams}`;
        const response = await this._fetch(url);
        return response.data;
    }

    /**
     * Saves an invoice (creates a new one or updates an existing one).
     * @param {Object} invoiceData - The data for the invoice.
     * @param {boolean} isEdit - True if editing an existing invoice, false if creating a new one.
     * @param {string|null} invoiceId - The ID of the invoice to update (if editing).
     * @returns {Promise<Object>} A promise that resolves to the saved invoice object.
     */
    async saveInvoice(invoiceData, isEdit, invoiceId) {
        const url = isEdit ? `${this.baseUrl}/${invoiceId}` : this.baseUrl;
        const method = isEdit ? 'PUT' : 'POST';
        return await this._fetch(url, {
            method,
            body: JSON.stringify(invoiceData),
        });
    }

    /**
     * Deletes an invoice.
     * @param {string} invoiceId - The ID of the invoice to delete.
     * @returns {Promise<Object>} A promise that resolves to the server's response.
     */
    async deleteInvoice(invoiceId) {
        const url = `${this.baseUrl}/${invoiceId}`;
        return await this._fetch(url, { method: 'DELETE' });
    }

    /**
     * Confirms an invoice.
     * @param {string} invoiceId - The ID of the invoice to confirm.
     * @returns {Promise<Object>} A promise that resolves to the server's response.
     */
    async confirmInvoice(invoiceId) {
        const url = `${this.baseUrl}/${invoiceId}/confirm`;
        return await this._fetch(url, { method: 'PUT' });
    }

    /**
     * Registers an invoice for payment.
     * @param {string} invoiceId - The ID of the invoice to register.
     * @returns {Promise<Object>} A promise that resolves to the server's response.
     */
    async registerInvoice(invoiceId) {
        const url = `${this.baseUrl}/${invoiceId}/register`;
        return await this._fetch(url, { method: 'PUT' });
    }

    /**
     * Generates a new invoice ID from the server.
     * @param {string} type - The type of invoice ('INV' or 'INVC').
     * @returns {Promise<string>} A promise that resolves to the new invoice ID.
     */
    async generateInvoiceId(type = 'INV') {
        const url = `${this.baseUrl}/generate-id?type=${type}`;
        const response = await this._fetch(url);
        return response.inv_id;
    }

    /**
     * Private helper method for making fetch requests.
     * @param {string} url - The URL to fetch.
     * @param {Object} [options={}] - The options for the fetch request.
     * @returns {Promise<Object>} A promise that resolves to the JSON response.
     * @private
     */
    async _fetch(url, options = {}) {
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                error: `HTTP error! status: ${response.status}`,
            }));
            throw new Error(errorData.error || 'An unknown error occurred.');
        }

        return response.json();
    }
}

export default InvoicesApiService;