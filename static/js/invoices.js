/**
 * Invoice Management JavaScript
 *
 * Main controller for the invoice management page.
 * This file orchestrates all the modules for the page.
 */

import ApiService from './modules/apiService.js';
import InvoicesApiService from './modules/InvoicesApiService.js';
import InvoicesDropdownManager from './modules/InvoicesDropdownManager.js';
import InvoicesModalManager from './modules/InvoicesModalManager.js';
import InvoicesFilterManager from './modules/InvoicesFilterManager.js';
import InvoicesTableRenderer from './modules/InvoicesTableRenderer.js';
import ToastManager from './modules/toastManager.js';

class InvoicesManager {
    constructor() {
        this.apiService = new ApiService();
        this.invoicesApiService = new InvoicesApiService();
        this.dropdownManager = new InvoicesDropdownManager();
        // Remove ToastManager initialization since it's a static class

        this.tableRenderer = new InvoicesTableRenderer('invoicesTableBody');
        this.filterManager = new InvoicesFilterManager({
            onFilterChange: (filters) => this.loadInvoices(filters),
        });
        this.modalManager = new InvoicesModalManager({
            onSave: (data, id) => this.saveInvoice(data, id),
            clients: this.clients,
            operations: this.operations
        });

        this.invoices = [];
        this.clients = [];
        this.operations = [];

        this.addInvoiceBtn = document.getElementById('createInvoiceBtn');

        this._setupEventListeners();
    }

    /**
     * Initializes the invoice manager.
     */
    async initialize() {
        await this.loadInitialData();
        this.loadInvoices();
    }

    /**
     * Sets up the main event listeners.
     * @private
     */
    _setupEventListeners() {
        this.addInvoiceBtn.addEventListener('click', () => this.modalManager.openForAdd());
    }

    /**
     * Loads the initial data required for the page (clients, operations).
     */
    async loadInitialData() {
        try {
            [this.clients, this.operations] = await Promise.all([
                this.apiService.loadClientsData(),
                this.apiService.loadOperationsData(),
            ]);

            // Update modal manager with fresh data
            this.modalManager.updateData(this.clients, this.operations);

            this.filterManager.populateClientFilter(this.clients);
            this.filterManager.populateStatusFilter();
            // You can similarly populate other dropdowns here
        } catch (error) {
            ToastManager.showToast(`Error loading initial data: ${error.message}`, 'error');
        }
    }

    /**
     * Loads invoices from the server and renders them.
     * @param {Object} [filters={}] - The filter criteria.
     */
    async loadInvoices(filters = {}) {
        try {
            this.invoices = await this.invoicesApiService.loadInvoices(filters);
            this.tableRenderer.render(this.invoices, (action, id) => this.handleAction(action, id));
        } catch (error) {
            ToastManager.showToast(`Error loading invoices: ${error.message}`, 'error');
        }
    }

    /**
     * Handles actions from the table (edit, delete, etc.).
     * @param {string} action - The action to perform.
     * @param {string} id - The ID of the invoice.
     */
    handleAction(action, id) {
        console.log('Action triggered:', action, 'ID:', id); // Debug log
        
        // Find invoice by database ID (id field)
        const invoice = this.invoices.find(inv => inv.id == id);
        if (!invoice) {
            console.error('Invoice not found with ID:', id);
            return;
        }

        console.log('Invoice found for action:', invoice); // Debug log

        switch (action) {
            case 'edit':
                // Use the inv_id (invoice number) for backend operations
                this.modalManager.openForEdit(invoice);
                break;
            case 'delete':
                // Use the inv_id (invoice number) for backend operations
                this.deleteInvoice(invoice.inv_id);
                break;
            case 'confirm':
                // Use the inv_id (invoice number) for backend operations
                this.confirmInvoice(invoice.inv_id);
                break;
            default:
                console.warn('Unknown action:', action);
        }
    }

    /**
     * Saves an invoice.
     * @param {Object} data - The invoice data from the form.
     * @param {string|null} id - The ID of the invoice to save (null for new invoices).
     */
    async saveInvoice(data, id) {
        try {
            const isEdit = id !== null;
            await this.invoicesApiService.saveInvoice(data, isEdit, id);
            this.modalManager.close();
            this.loadInvoices(this.filterManager.getFilters());
            ToastManager.showToast(`Invoice ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
        } catch (error) {
            ToastManager.showToast(`Error saving invoice: ${error.message}`, 'error');
        }
    }

    /**
     * Deletes an invoice.
     * @param {string} id - The ID of the invoice to delete.
     */
    async deleteInvoice(id) {
        if (!confirm('Are you sure you want to delete this invoice?')) {
            return;
        }
        try {
            await this.invoicesApiService.deleteInvoice(id);
            this.loadInvoices(this.filterManager.getFilters());
            ToastManager.showToast('Invoice deleted successfully!', 'success');
        } catch (error) {
            ToastManager.showToast(`Error deleting invoice: ${error.message}`, 'error');
        }
    }

    /**
     * Confirms an invoice.
     * @param {string} id - The ID of the invoice to confirm.
     */
    async confirmInvoice(id) {
        try {
            await this.invoicesApiService.confirmInvoice(id);
            this.loadInvoices(this.filterManager.getFilters());
            ToastManager.showToast('Invoice confirmed successfully!', 'success');
        } catch (error) {
            ToastManager.showToast(`Error confirming invoice: ${error.message}`, 'error');
        }
    }
}

// Initialize the manager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const invoicesManager = new InvoicesManager();
    invoicesManager.initialize();
});