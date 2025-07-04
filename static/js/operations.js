/**
 * Operations Management JavaScript
 * Handles all operations-related functionality using Flowbite components
 * 
 * Features:
 * - Load operations from API
 * - Create/Edit/Delete operations
 * - Confirm operations (admin only)
 * - Filter and search operations
 * - Flowbite modal integration
 * - Toast notifications
 * - JWT authentication handling
 */

import ApiService from './modules/apiService.js';
import OperationsApiService from './modules/OperationsApiService.js';
import OperationsDropdownManager from './modules/OperationsDropdownManager.js';
import OperationsModalManager from './modules/OperationsModalManager.js';
import OperationsFilterManager from './modules/OperationsFilterManager.js';
import OperationsTableRenderer from './modules/OperationsTableRenderer.js';
import ToastManager from './modules/toastManager.js';

class OperationsManager {
    constructor() {
        this.operationsData = [];
        this.currentEditingId = null;
        this.currentUser = null;
        this.clientsData = [];
        this.vendorsData = [];
        
        // API Configuration
        this.apiService = new ApiService('/ajax/operations', {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
        });
        
        this.operationsApiService = new OperationsApiService('/ajax/operations', {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
        });
        
        // DOM Elements
        this.modalManager = new OperationsModalManager();
        this.clientDropdownManager = new OperationsDropdownManager('client');
        this.vendorDropdownManager = new OperationsDropdownManager('vendor');
        this.clientFilterManager = new OperationsFilterManager('client');
        this.vendorFilterManager = new OperationsFilterManager('vendor');
        this.tableRenderer = new OperationsTableRenderer();
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    async initializeComponents() {
        try {
            // Remove getCurrentUser call since no auth endpoint exists
            this.modalManager.initializeModals();
            this.setupEventListeners();
            await this.loadOperations();
            await this.loadClientsAndVendors();
        } catch (error) {
            console.error('Initialization error:', error);
            ToastManager.showToast('Initialization failed: ' + error.message, 'error');
        }
    }

    // ============================================================================
    // Authentication & Token Management
    // ============================================================================

    getCsrfToken() {
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        return csrfToken ? csrfToken.getAttribute('content') : '';
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // ============================================================================
    // Data Management - Load clients and vendors once for reuse
    // ============================================================================

    async loadClientsAndVendors() {
        try {
            [this.clientsData, this.vendorsData] = await Promise.all([
                this.apiService.loadClientsData(),
                this.apiService.loadVendorsData()
            ]);
            
            // Populate dropdowns and filters
            this.clientDropdownManager.populateDropdown(this.clientsData);
            this.vendorDropdownManager.populateDropdown(this.vendorsData);
            this.clientFilterManager.populateFilterDropdown(this.clientsData);
            this.vendorFilterManager.populateFilterDropdown(this.vendorsData);
        } catch (error) {
            console.error('Error loading clients/vendors:', error);
            ToastManager.showToast('Error loading clients/vendors: ' + error.message, 'error');
        }
    }

    // ============================================================================
    // Event Listeners
    // ============================================================================

    setupEventListeners() {
        // Button event listeners
        const addOperationBtn = document.getElementById('addOperationBtn');
        const refreshBtn = document.getElementById('refreshBtn');
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');
        
        if (addOperationBtn) addOperationBtn.addEventListener('click', () => this.openAddModal());
        if (refreshBtn) refreshBtn.addEventListener('click', () => this.loadOperations());
        if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', () => this.resetFilters());

        // Modal close event listeners
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelModalBtn = document.getElementById('cancelModalBtn');
        const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        
        if (closeModalBtn) closeModalBtn.addEventListener('click', () => this.closeModal());
        if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => this.closeModal());
        if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', () => this.closeDeleteModal());
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => this.closeDeleteModal());

        // Form submission
        const operationForm = document.getElementById('operationForm');
        if (operationForm) {
            operationForm.addEventListener('submit', (e) => this.saveOperation(e));
        }

        // Delete confirmation
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        }
        
        // Confirm operation
        const confirmOperationBtn = document.getElementById('confirmOperationBtn');
        if (confirmOperationBtn) {
            confirmOperationBtn.addEventListener('click', () => this.confirmOperationAction());
        }
    }

    // ============================================================================
    // API Operations
    // ============================================================================

    async loadOperations() {
        try {
            this.tableRenderer.showLoadingSpinner();
            this.operationsData = await this.operationsApiService.loadOperations();
            this.tableRenderer.setOperationsData(this.operationsData);
            this.tableRenderer.renderOperationsTable();
            ToastManager.showToast('Operations loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading operations:', error);
            ToastManager.showToast('Error loading operations: ' + error.message, 'error');
            
            if (error.message.includes('log in')) {
                window.location.href = '/login';
            }
        }
    }

    async saveOperation(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const operationData = this.buildOperationDataFromForm(formData);
            
            if (!this.validateOperationData(operationData)) {
                return;
            }

            const isEdit = this.currentEditingId !== null;
            const result = await this.operationsApiService.saveOperation(
                operationData, 
                isEdit, 
                this.currentEditingId
            );
            
            ToastManager.showToast(result.message || `Operation ${isEdit ? 'updated' : 'created'} successfully`, 'success');
            this.closeModal();
            this.loadOperations();
        } catch (error) {
            console.error('Error saving operation:', error);
            ToastManager.showToast('Error saving operation: ' + error.message, 'error');
        }
    }

    async deleteOperation(operationNum) {
        try {
            const result = await this.operationsApiService.deleteOperation(operationNum);
            ToastManager.showToast(result.message || 'Operation deleted successfully', 'success');
            this.loadOperations();
        } catch (error) {
            console.error('Error deleting operation:', error);
            ToastManager.showToast('Error deleting operation: ' + error.message, 'error');
        }
    }

    async confirmOperation(operationNum) {
        try {
            const result = await this.operationsApiService.confirmOperation(operationNum);
            ToastManager.showToast(result.message || 'Operation confirmed successfully', 'success');
            this.loadOperations();
        } catch (error) {
            console.error('Error confirming operation:', error);
            ToastManager.showToast('Error confirming operation: ' + error.message, 'error');
        }
    }

    // ============================================================================
    // Data Filtering
    // ============================================================================

    async applyFilters() {
        try {
            const filters = this.getFilterValues();
            const queryParams = new URLSearchParams();
            
            Object.keys(filters).forEach(key => {
                if (filters[key]) queryParams.append(key, filters[key]);
            });

            const url = `/ajax/operations?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.apiService.headers,
                credentials: 'same-origin'
            });

            if (response.ok) {
                const result = await response.json();
                this.operationsData = result.data || [];
                this.tableRenderer.setOperationsData(this.operationsData);
                this.tableRenderer.renderOperationsTable();
                
                const activeFilters = Object.values(filters).filter(val => val).length;
                const message = activeFilters > 0 
                    ? `Found ${this.operationsData.length} operations with ${activeFilters} filters`
                    : 'All operations loaded (no filters active)';
                
                ToastManager.showToast(message, 'info');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error applying filters:', error);
            ToastManager.showToast('Error applying filters: ' + error.message, 'error');
        }
    }

    getFilterValues() {
        return {
            client_name: document.getElementById('clientFilter')?.value || '',
            vendor_name: document.getElementById('vendorFilter')?.value || '',
            status: document.getElementById('statusFilter')?.value || '',
            date_from: document.getElementById('dateFromFilter')?.value || '',
            date_to: document.getElementById('dateToFilter')?.value || '',
            operation_num: document.getElementById('operationIdFilter')?.value || ''
        };
    }

    resetFilters() {
        // Reset client filter dropdown
        const clientFilterInput = document.getElementById('clientFilter');
        const clientFilterButtonText = document.getElementById('clientFilterDropdownButtonText');
        if (clientFilterInput) clientFilterInput.value = '';
        if (clientFilterButtonText) {
            clientFilterButtonText.textContent = 'All Clients';
            clientFilterButtonText.classList.add('text-gray-500');
            clientFilterButtonText.classList.remove('text-gray-900', 'dark:text-white');
        }
        
        // Reset vendor filter dropdown
        const vendorFilterInput = document.getElementById('vendorFilter');
        const vendorFilterButtonText = document.getElementById('vendorFilterDropdownButtonText');
        if (vendorFilterInput) vendorFilterInput.value = '';
        if (vendorFilterButtonText) {
            vendorFilterButtonText.textContent = 'All Vendors';
            vendorFilterButtonText.classList.add('text-gray-500');
            vendorFilterButtonText.classList.remove('text-gray-900', 'dark:text-white');
        }
        
        // Reset other filters
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('operationIdFilter').value = '';
        
        this.loadOperations();
        ToastManager.showToast('Filters reset', 'info');
    }

    // ============================================================================
    // Modal Operations
    // ============================================================================

    async openAddModal() {
        this.currentEditingId = null;
        this.clearForm();
        
        // Generate new operation number
        try {
            const operationNum = await this.operationsApiService.generateOperationNumber();
            document.getElementById('operationNum').value = operationNum;
        } catch (error) {
            console.error('Error generating operation number:', error);
        }

        document.getElementById('modalTitle').textContent = 'Add New Operation';
        document.getElementById('saveOperationBtn').textContent = 'Create Operation';
        this.modalManager.showModal('operation');
    }

    async openEditModal(operationNum) {
        this.currentEditingId = operationNum;
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        
        if (!operation) {
            ToastManager.showToast('Operation not found', 'error');
            return;
        }

        this.populateForm(operation);
        document.getElementById('modalTitle').textContent = 'Edit Operation';
        document.getElementById('saveOperationBtn').textContent = 'Update Operation';
        this.modalManager.showModal('operation');
    }

    openDeleteModal(operationNum) {
        this.currentEditingId = operationNum;
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        
        if (operation) {
            document.getElementById('deleteOperationInfo').textContent = 
                `Are you sure you want to delete operation "${operation.operation_num}"? This action cannot be undone.`;
        }
        
        this.modalManager.showModal('delete');
    }

    openConfirmModal(operationNum) {
        this.currentEditingId = operationNum;
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        
        if (operation) {
            document.getElementById('confirmOperationInfo').textContent = 
                `Are you sure you want to confirm operation "${operation.operation_num}"? This will change its status to confirmed.`;
        }
        
        this.modalManager.showModal('confirm');
    }

    closeModal() {
        this.modalManager.hideModal('operation');
        this.modalManager.hideModal('delete');
        this.modalManager.hideModal('confirm');
        this.currentEditingId = null;
    }

    closeDeleteModal() {
        this.modalManager.hideModal('delete');
        this.currentEditingId = null;
    }

    async confirmDelete() {
        if (this.currentEditingId) {
            await this.deleteOperation(this.currentEditingId);
            this.closeModal();
        }
    }

    async confirmOperationAction() {
        if (this.currentEditingId) {
            await this.confirmOperation(this.currentEditingId);
            this.closeModal();
        }
    }

    // ============================================================================
    // Form Handling
    // ============================================================================
    
    clearForm() {
        const form = document.getElementById('operationForm');
        if (form) form.reset();
        
        // Reset dropdowns
        const resetDropdown = (type) => {
            const buttonText = document.getElementById(`${type}DropdownButtonText`);
            const hiddenInput = document.getElementById(`${type}Name`);
            
            if (buttonText) {
                buttonText.textContent = `Select a ${type}...`;
                buttonText.classList.remove('text-gray-900', 'dark:text-white');
                buttonText.classList.add('text-gray-500');
            }
            
            if (hiddenInput) hiddenInput.value = '';
        };
        
        resetDropdown('client');
        resetDropdown('vendor');
    }
    
    populateForm(operation) {
        const fields = [
            { id: 'operationNum', value: operation.operation_num },
            { id: 'operationDate', value: this.formatDateForInput(operation.operation_date) },
            { id: 'description', value: operation.description },
            { id: 'reference', value: operation.reference },
            { id: 'flux', value: operation.flux },
            { id: 'positioningDate', value: this.formatDateForInput(operation.positioning_date) },
            { id: 'shipperCity', value: operation.shipper_city },
            { id: 'receiverCity', value: operation.receiver_city },
            { id: 'loadingDate', value: this.formatDateForInput(operation.loading_date) },
            { id: 'eta', value: this.formatDateTimeForInput(operation.eta) },
            { id: 'unloadingDate', value: this.formatDateTimeForInput(operation.unloading_date) },
            { id: 'sr', value: operation.sr },
            { id: 'cmr', value: operation.cmr },
            { id: 'isConfirmed', value: operation.is_confirmed ? 'true' : 'false' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) element.value = field.value || '';
        });
        
        // Set dropdown values
        const setDropdown = (type, value) => {
            const buttonText = document.getElementById(`${type}DropdownButtonText`);
            const hiddenInput = document.getElementById(`${type}Name`);
            
            if (value && buttonText && hiddenInput) {
                buttonText.textContent = value;
                buttonText.classList.remove('text-gray-500');
                buttonText.classList.add('text-gray-900', 'dark:text-white');
                hiddenInput.value = value;
            }
        };
        
        setDropdown('client', operation.client_name);
        setDropdown('vendor', operation.vendor_name);
    }
    
    buildOperationDataFromForm(formData) {
        return {
            operation_num: formData.get('operation_num'),
            client_name: formData.get('client_name'),
            operation_date: formData.get('operation_date'),
            description: formData.get('description'),
            reference: formData.get('reference'),
            flux: formData.get('flux'),
            positioning_date: formData.get('positioning_date'),
            shipper_city: formData.get('shipper_city'),
            receiver_city: formData.get('receiver_city'),
            loading_date: formData.get('loading_date'),
            eta: formData.get('eta'),
            unloading_date: formData.get('unloading_date'),
            vendor_name: formData.get('vendor_name'),
            sr: formData.get('sr'),
            cmr: formData.get('cmr'),
            is_confirmed: formData.get('is_confirmed') === 'true'
        };
    }
    
    validateOperationData(data) {
        const requiredFields = ['client_name', 'operation_date'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            ToastManager.showToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
            return false;
        }
        
        return true;
    }

    // ============================================================================
    // Utility Functions
    // ============================================================================

    formatDateForInput(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toISOString().split('T')[0];
    }

    formatDateTimeForInput(dateTimeStr) {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        return date.toISOString().slice(0, 16);
    }
}

// Initialize the operations manager when DOM is ready
window.operationsManager = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.operationsManager = new OperationsManager();
    });
} else {
    window.operationsManager = new OperationsManager();
}
