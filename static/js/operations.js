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

class OperationsManager {
    constructor() {
        this.operationsData = [];
        this.currentEditingId = null;
        this.currentUser = null;
        this.clientsData = []; // Store clients data globally
        this.vendorsData = []; // Store vendors data globally
          // API Configuration
        this.apiBaseUrl = '/ajax/operations';
        this.headers = {
            'Content-Type': 'application/json'
        };
        
        // DOM Elements
        this.operationModal = null;
        this.deleteModal = null;
        this.confirmModal = null;
        
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }    initializeComponents() {
        this.setupAuthToken();
        this.setupModals();
        this.setupEventListeners();
        this.loadOperations();
        this.loadClientsAndVendors(); // Load both clients and vendors once
    }

    // ============================================================================
    // Authentication & Token Management
    // ============================================================================

    setupAuthToken() {
        // For web interface, we'll use session-based auth with CSRF protection
        // Get CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]');
        if (csrfToken) {
            this.headers['X-CSRFToken'] = csrfToken.getAttribute('content');
        }
    }

    async getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        
        try {
            const response = await fetch('/api/auth/me', {
                headers: this.headers
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                return this.currentUser;
            }        } catch (error) {
            console.error('Error fetching current user:', error);
        }
        return null;
    }
      isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // ============================================================================
    // Data Management - Load clients and vendors once for reuse
    // ============================================================================

    async loadClientsAndVendors() {
        // Load both clients and vendors once and store globally
        await Promise.all([
            this.loadClientsData(),
            this.loadVendorsData()
        ]);
        
        // Populate filter dropdowns after loading data
        this.populateClientFilterDropdown(this.clientsData);
        this.populateVendorFilterDropdown(this.vendorsData);
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
                    this.clientsData = result.data;
                    console.log(`Loaded ${this.clientsData.length} clients for global use`);
                } else {
                    console.error('Failed to load clients:', result.error);
                    this.showToast('Failed to load clients', 'error');
                }
            } else {
                console.error('Error loading clients:', response.status);
                this.showToast('Error loading clients', 'error');
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            this.showToast('Error loading clients', 'error');
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
                    this.vendorsData = result.data;
                    console.log(`Loaded ${this.vendorsData.length} vendors for global use`);
                } else {
                    console.error('Failed to load vendors:', result.error);
                    this.showToast('Failed to load vendors', 'error');                }
            } else {
                console.error('Error loading vendors:', response.status);
                this.showToast('Error loading vendors', 'error');
            }        } catch (error) {
            console.error('Error loading vendors:', error);
            this.showToast('Error loading vendors', 'error');
        }
    }

    // ============================================================================
    // Client Management (Modal Dropdowns)
    // ============================================================================
    
    populateClientDropdown(clients) {
        // Populate the searchable client dropdown with options
        const clientDropdownList = document.getElementById('clientDropdownList');
        if (!clientDropdownList) return;
        
        // Clear existing options
        clientDropdownList.innerHTML = '';
        
        // Don't overwrite the global data - it's already stored
        
        // Add client options
        clients.forEach(client => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer client-option" data-client-id="${client.id}" data-client-name="${client.name}">
                    <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${client.name}</span>
                </div>
            `;
            clientDropdownList.appendChild(li);
        });
        
        // Add click event listeners to client options
        this.setupClientDropdownEvents();
        
        console.log(`Populated ${clients.length} clients into modal dropdown`);
    }
      setupClientDropdownEvents() {
        // Setup search functionality
        const searchInput = document.getElementById('clientSearchInput');
        const clientOptions = document.querySelectorAll('.client-option');
        const dropdownButton = document.getElementById('clientDropdownButton');
        const dropdownButtonText = document.getElementById('clientDropdownButtonText');
        const hiddenInput = document.getElementById('clientName');
        const dropdown = document.getElementById('clientDropdown');
        
        // Dropdown toggle functionality
        if (dropdownButton && dropdown) {
            dropdownButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle dropdown visibility
                if (dropdown.classList.contains('hidden')) {
                    dropdown.classList.remove('hidden');
                    // Focus on search input when opening
                    if (searchInput) {
                        setTimeout(() => searchInput.focus(), 100);
                    }
                } else {
                    dropdown.classList.add('hidden');
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && !dropdownButton.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                clientOptions.forEach(option => {
                    const clientName = option.getAttribute('data-client-name').toLowerCase();
                    const listItem = option.parentElement;
                    
                    if (clientName.includes(searchTerm)) {
                        listItem.style.display = 'block';
                    } else {
                        listItem.style.display = 'none';
                    }
                });
            });
        }
        
        // Client selection functionality
        clientOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const clientId = e.currentTarget.getAttribute('data-client-id');
                const clientName = e.currentTarget.getAttribute('data-client-name');
                
                // Update the dropdown button text
                dropdownButtonText.textContent = clientName;
                dropdownButtonText.classList.remove('text-gray-500');
                dropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
                
                // Update the hidden input value
                hiddenInput.value = clientName;
                
                // Close the dropdown
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
                
                // Clear search input
                if (searchInput) {
                    searchInput.value = '';
                    // Reset all options visibility
                    clientOptions.forEach(opt => {
                        opt.parentElement.style.display = 'block';
                    });
                }
                
                console.log(`Selected client: ${clientName} (ID: ${clientId})`);            });
        });
    }

    // ============================================================================
    // Vendor Management (Modal Dropdowns)
    // ============================================================================

    populateVendorDropdown(vendors) {
        // Populate the searchable vendor dropdown with options
        const vendorDropdownList = document.getElementById('vendorDropdownList');
        if (!vendorDropdownList) return;
        
        // Clear existing options
        vendorDropdownList.innerHTML = '';
        
        // Don't overwrite the global data - it's already stored
        
        // Add vendor options
        vendors.forEach(vendor => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer vendor-option" data-vendor-id="${vendor.id}" data-vendor-name="${vendor.name}">
                    <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${vendor.name}</span>
                </div>
            `;
            vendorDropdownList.appendChild(li);
        });
        
        // Add click event listeners to vendor options
        this.setupVendorDropdownEvents();
        
        console.log(`Populated ${vendors.length} vendors into modal dropdown`);
    }

    setupVendorDropdownEvents() {
        // Setup search functionality
        const searchInput = document.getElementById('vendorSearchInput');
        const vendorOptions = document.querySelectorAll('.vendor-option');
        const dropdownButton = document.getElementById('vendorDropdownButton');
        const dropdownButtonText = document.getElementById('vendorDropdownButtonText');
        const hiddenInput = document.getElementById('vendorName');
        const dropdown = document.getElementById('vendorDropdown');
        
        // Dropdown toggle functionality
        if (dropdownButton && dropdown) {
            dropdownButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Toggle dropdown visibility
                if (dropdown.classList.contains('hidden')) {
                    dropdown.classList.remove('hidden');
                    // Focus on search input when opening
                    if (searchInput) {
                        setTimeout(() => searchInput.focus(), 100);
                    }
                } else {
                    dropdown.classList.add('hidden');
                }
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && !dropdownButton.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
        
        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                vendorOptions.forEach(option => {
                    const vendorName = option.getAttribute('data-vendor-name').toLowerCase();
                    const listItem = option.parentElement;
                    
                    if (vendorName.includes(searchTerm)) {
                        listItem.style.display = 'block';
                    } else {
                        listItem.style.display = 'none';
                    }
                });
            });
        }
        
        // Vendor selection functionality
        vendorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const vendorId = e.currentTarget.getAttribute('data-vendor-id');
                const vendorName = e.currentTarget.getAttribute('data-vendor-name');
                
                // Update the dropdown button text
                dropdownButtonText.textContent = vendorName;
                dropdownButtonText.classList.remove('text-gray-500');
                dropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
                
                // Update the hidden input value
                hiddenInput.value = vendorName;
                
                // Close the dropdown
                if (dropdown) {
                    dropdown.classList.add('hidden');
                }
                
                // Clear search input
                if (searchInput) {
                    searchInput.value = '';
                    // Reset all options visibility
                    vendorOptions.forEach(opt => {
                        opt.parentElement.style.display = 'block';
                    });
                }
                
                console.log(`Selected vendor: ${vendorName} (ID: ${vendorId})`);
            });
        });
    }

    // ============================================================================
    // Flowbite Modal Setup
    // ============================================================================
      setupModals() {
        // Wait for Flowbite to be available and initialize modals
        const initializeModals = () => {
            const operationModalEl = document.getElementById('operationModal');
            const deleteModalEl = document.getElementById('deleteModal');
            const confirmModalEl = document.getElementById('confirmModal');

            if (typeof Modal !== 'undefined' && operationModalEl) {
                // Create modal instances with proper accessibility configuration
                this.operationModal = new Modal(operationModalEl, {
                    placement: 'center',
                    backdrop: 'dynamic',
                    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                    closable: true,
                    onShow: () => {
                        // Remove aria-hidden when modal is shown and manage focus properly
                        operationModalEl.removeAttribute('aria-hidden');
                    },
                    onHide: () => {
                        // Set aria-hidden when modal is hidden
                        operationModalEl.setAttribute('aria-hidden', 'true');
                    }
                });
                
                if (deleteModalEl) {
                    this.deleteModal = new Modal(deleteModalEl, {
                        placement: 'center',
                        backdrop: 'dynamic',
                        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                        closable: true,
                        onShow: () => {
                            deleteModalEl.removeAttribute('aria-hidden');
                        },
                        onHide: () => {
                            deleteModalEl.setAttribute('aria-hidden', 'true');
                        }
                    });
                }
                
                if (confirmModalEl) {
                    this.confirmModal = new Modal(confirmModalEl, {
                        placement: 'center',
                        backdrop: 'dynamic',
                        backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                        closable: true,
                        onShow: () => {
                            confirmModalEl.removeAttribute('aria-hidden');
                        },
                        onHide: () => {
                            confirmModalEl.setAttribute('aria-hidden', 'true');
                        }
                    });
                }

                console.log('Operations modals initialized successfully');
            } else {
                console.log('Modal elements or Flowbite not ready, retrying...');
                setTimeout(initializeModals, 100);
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeModals);
        } else {
            initializeModals();
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
        const resetFiltersBtn = document.getElementById('resetFiltersBtn');        if (addOperationBtn) addOperationBtn.addEventListener('click', () => this.openAddModal());
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
        }        // Confirm operation
        const confirmOperationBtn = document.getElementById('confirmOperationBtn');
        if (confirmOperationBtn) {
            confirmOperationBtn.addEventListener('click', () => this.confirmOperationAction());
        }
    }

    // ============================================================================
    // Filter Dropdown Management    // ============================================================================
    // Filter Dropdown Management
    // ============================================================================

    populateClientFilterDropdown(clients) {
        const clientFilter = document.getElementById('clientFilter');
        if (!clientFilter) return;
        
        // Clear existing options except the first "All Clients" option
        while (clientFilter.children.length > 1) {
            clientFilter.removeChild(clientFilter.lastChild);
        }
        
        // Sort clients alphabetically for better UX
        const sortedClients = clients.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add client options
        sortedClients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            clientFilter.appendChild(option);
        });
        
        console.log(`Loaded ${clients.length} clients into filter dropdown`);
    }

    populateVendorFilterDropdown(vendors) {
        const vendorFilter = document.getElementById('vendorFilter');
        if (!vendorFilter) return;
        
        // Clear existing options except the first "All Vendors" option
        while (vendorFilter.children.length > 1) {
            vendorFilter.removeChild(vendorFilter.lastChild);
        }
        
        // Sort vendors alphabetically for better UX
        const sortedVendors = vendors.sort((a, b) => a.name.localeCompare(b.name));
        
        // Add vendor options
        sortedVendors.forEach(vendor => {
            const option = document.createElement('option');
            option.value = vendor.name;
            option.textContent = vendor.name;
            vendorFilter.appendChild(option);
        });
        
        console.log(`Loaded ${vendors.length} vendors into filter dropdown`);
    }

    // ============================================================================
    // API Operations
    // ============================================================================
    // ============================================================================

    async loadOperations() {
        try {
            this.showLoadingSpinner();
            
            const response = await fetch(this.apiBaseUrl, {
                method: 'GET',
                headers: this.headers,
                credentials: 'same-origin' // Include session cookies
            });

            if (response.ok) {
                const result = await response.json();
                this.operationsData = result.data || [];
                this.renderOperationsTable();
                this.showToast('Operations loaded successfully', 'success');
            } else if (response.status === 401) {
                this.showToast('Please log in to view operations', 'error');
                // Redirect to login if needed
                window.location.href = '/login';
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error loading operations:', error);
            this.showToast('Error loading operations: ' + error.message, 'error');
        } finally {
            this.hideLoadingSpinner();
        }
    }

    async saveOperation(event) {
        event.preventDefault();
        
        try {
            const formData = new FormData(event.target);
            const operationData = this.buildOperationDataFromForm(formData);
            
            // Validate required fields
            if (!this.validateOperationData(operationData)) {
                return;
            }

            const isEdit = this.currentEditingId !== null;            const url = isEdit ? `${this.apiBaseUrl}/${this.currentEditingId}` : this.apiBaseUrl;
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: this.headers,
                body: JSON.stringify(operationData),
                credentials: 'same-origin' // Include session cookies
            });

            if (response.ok) {
                const result = await response.json();
                this.showToast(result.message || `Operation ${isEdit ? 'updated' : 'created'} successfully`, 'success');
                this.closeModal();
                this.loadOperations(); // Refresh the table
            } else {
                const error = await response.json();
                this.showToast('Error: ' + (error.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Error saving operation:', error);            this.showToast('Error saving operation: ' + error.message, 'error');
        }
    }

    async deleteOperation(operationNum) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${operationNum}`, {
                method: 'DELETE',
                headers: this.headers,
                credentials: 'same-origin' // Include session cookies
            });

            if (response.ok) {
                const result = await response.json();
                this.showToast(result.message || 'Operation deleted successfully', 'success');
                this.loadOperations(); // Refresh the table
            } else {
                const error = await response.json();
                this.showToast('Error: ' + (error.error || 'Failed to delete operation'), 'error');
            }
        } catch (error) {            console.error('Error deleting operation:', error);
            this.showToast('Error deleting operation: ' + error.message, 'error');
        }
    }

    async confirmOperation(operationNum) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/${operationNum}/confirm`, {
                method: 'PUT',
                headers: this.headers,
                credentials: 'same-origin' // Include session cookies
            });

            if (response.ok) {
                const result = await response.json();
                this.showToast(result.message || 'Operation confirmed successfully', 'success');
                this.loadOperations(); // Refresh the table
            } else {
                const error = await response.json();
                this.showToast('Error: ' + (error.error || 'Failed to confirm operation'), 'error');
            }
        } catch (error) {
            console.error('Error confirming operation:', error);
            this.showToast('Error confirming operation: ' + error.message, 'error');
        }
    }    // ============================================================================
    // Data Filtering
    // ============================================================================
      async applyFilters() {
        const filters = this.getFilterValues();
        
        // Count active filters and create descriptive list
        const activeFiltersList = [];
        if (filters.client_name) activeFiltersList.push(`Client: ${filters.client_name}`);
        if (filters.vendor_name) activeFiltersList.push(`Vendor: ${filters.vendor_name}`);
        if (filters.status) activeFiltersList.push(`Status: ${filters.status}`);
        if (filters.date_from) activeFiltersList.push(`From: ${filters.date_from}`);
        if (filters.date_to) activeFiltersList.push(`To: ${filters.date_to}`);
        if (filters.operation_num) activeFiltersList.push(`Operation: ${filters.operation_num}`);
        
        const activeFilters = activeFiltersList.length;
        
        try {
            const queryParams = new URLSearchParams();
            
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    queryParams.append(key, filters[key]);
                }
            });

            const url = `${this.apiBaseUrl}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
              const response = await fetch(url, {
                method: 'GET',
                headers: this.headers,
                credentials: 'same-origin' // Include session cookies
            });

            if (response.ok) {
                const result = await response.json();
                this.operationsData = result.data || [];
                this.renderOperationsTable();
                
                if (activeFilters > 0) {
                    const filterDescription = activeFiltersList.length <= 2 
                        ? activeFiltersList.join(', ')
                        : `${activeFiltersList.length} filters`;
                    this.showToast(`Found ${this.operationsData.length} operations with ${filterDescription}`, 'info');
                } else {
                    this.showToast('All operations loaded (no filters active)', 'info');
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }        } catch (error) {
            console.error('Error applying filters:', error);
            this.showToast('Error applying filters: ' + error.message, 'error');
        }
    }

    getFilterValues() {
        return {
            client_name: document.getElementById('clientFilter')?.value || '',
            vendor_name: document.getElementById('vendorFilter')?.value || '',
            status: document.getElementById('statusFilter')?.value || '',
            date_from: document.getElementById('dateFromFilter')?.value || '',
            date_to: document.getElementById('dateToFilter')?.value || '',            operation_num: document.getElementById('operationIdFilter')?.value || ''
        };
    }    resetFilters() {
        document.getElementById('clientFilter').value = '';
        document.getElementById('vendorFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        document.getElementById('operationIdFilter').value = '';
        
        this.loadOperations();
        this.showToast('Filters reset', 'info');
    }

    // ============================================================================
    // Table Rendering
    // ============================================================================

    renderOperationsTable() {
        const tbody = document.getElementById('operationsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.operationsData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="18" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div class="flex flex-col items-center">
                            <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1M9 7h6"></path>
                            </svg>
                            <p class="text-lg font-medium">No operations found</p>
                            <p class="text-sm">Create your first operation to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        this.operationsData.forEach(operation => {
            const row = this.createOperationRow(operation);
            tbody.appendChild(row);
        });
    }

    createOperationRow(operation) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200';
        
        const isConfirmed = operation.is_confirmed;
        const statusClass = isConfirmed 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';

        const statusText = isConfirmed ? 'Confirmed' : 'Not Confirmed';

        row.innerHTML = `
            <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                    <button onclick="operationsManager.openEditModal('${operation.operation_num}')" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                            title="Edit Operation">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    ${!isConfirmed ? `
                    <button onclick="operationsManager.openConfirmModal('${operation.operation_num}')" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors duration-200"
                            title="Confirm Operation">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="operationsManager.openDeleteModal('${operation.operation_num}')" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
                            title="Delete Operation">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${operation.operation_id || ''}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${operation.operation_num || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.client_name || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.formatDate(operation.operation_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.description || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.reference || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.flux || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.formatDate(operation.positioning_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.shipper_city || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.receiver_city || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.formatDate(operation.loading_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.formatDateTime(operation.eta)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${this.formatDateTime(operation.unloading_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.vendor_name || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.sr || ''}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${operation.cmr || ''}</td>
            <td class="px-4 py-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">
                    ${statusText}
                </span>
            </td>
        `;        return row;
    }

    // ============================================================================
    // Modal Operations
    // ============================================================================
    async openAddModal() {
        this.currentEditingId = null;
        this.clearForm();
        
        // Use pre-loaded data for the dropdowns (no API calls needed)
        this.populateClientDropdown(this.clientsData);
        this.populateVendorDropdown(this.vendorsData);
        
        // Generate new operation number
        await this.generateOperationNumber();
        
        document.getElementById('modalTitle').textContent = 'Add New Operation';
        document.getElementById('saveOperationBtn').textContent = 'Create Operation';
        
        if (this.operationModal) {
            this.operationModal.show();
        } else {
            console.error('operationModal is not initialized');
            // Fallback: try to show modal using direct DOM manipulation
            const modalEl = document.getElementById('operationModal');            if (modalEl) {
                modalEl.classList.remove('hidden');
                modalEl.classList.add('flex');
                modalEl.removeAttribute('aria-hidden');
            }
        }
    }

    async openEditModal(operationNum) {
        this.currentEditingId = operationNum;
        
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        if (!operation) {
            this.showToast('Operation not found', 'error');
            return;
        }

        // Use pre-loaded data for the dropdowns (no API calls needed)
        this.populateClientDropdown(this.clientsData);
        this.populateVendorDropdown(this.vendorsData);
        
        // Then populate the form with operation data
        this.populateForm(operation);
        
        document.getElementById('modalTitle').textContent = 'Edit Operation';
        document.getElementById('saveOperationBtn').textContent = 'Update Operation';
        
        if (this.operationModal) {
            this.operationModal.show();
        }
    }

    openDeleteModal(operationNum) {
        this.currentEditingId = operationNum;
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        
        if (operation) {
            document.getElementById('deleteOperationInfo').textContent = 
                `Are you sure you want to delete operation "${operation.operation_num}"? This action cannot be undone.`;
        }
        
        if (this.deleteModal) {
            this.deleteModal.show();
        }
    }

    openConfirmModal(operationNum) {
        this.currentEditingId = operationNum;
        const operation = this.operationsData.find(op => op.operation_num === operationNum);
        
        if (operation) {
            document.getElementById('confirmOperationInfo').textContent = 
                `Are you sure you want to confirm operation "${operation.operation_num}"? This will change its status to confirmed.`;
        }
        
        if (this.confirmModal) {
            this.confirmModal.show();
        }
    }
      closeModal() {
        if (this.operationModal) {
            this.operationModal.hide();
        } else {
            // Fallback: hide modal using direct DOM manipulation
            const modalEl = document.getElementById('operationModal');
            if (modalEl) {
                modalEl.classList.add('hidden');
                modalEl.classList.remove('flex');
            }
        }
        
        if (this.deleteModal) {
            this.deleteModal.hide();
        } else {
            // Fallback: hide delete modal using direct DOM manipulation  
            const deleteModalEl = document.getElementById('deleteModal');
            if (deleteModalEl) {
                deleteModalEl.classList.add('hidden');
                deleteModalEl.classList.remove('flex');
            }
        }
        
        if (this.confirmModal) {
            this.confirmModal.hide();
        }
        
        this.currentEditingId = null;
    }    closeDeleteModal() {
        if (this.deleteModal) {
            this.deleteModal.hide();
        } else {
            // Fallback: hide modal using direct DOM manipulation
            const deleteModalEl = document.getElementById('deleteModal');
            if (deleteModalEl) {
                deleteModalEl.classList.add('hidden');
                deleteModalEl.classList.remove('flex');
            }
        }
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
    }    // ============================================================================
    // Form Handling
    // ============================================================================
    
    clearForm() {
        const form = document.getElementById('operationForm');
        if (form) {
            form.reset();
        }
        
        // Reset the client and vendor dropdowns
        const clientDropdownButtonText = document.getElementById('clientDropdownButtonText');
        const clientHiddenInput = document.getElementById('clientName');
        const vendorDropdownButtonText = document.getElementById('vendorDropdownButtonText');
        const vendorHiddenInput = document.getElementById('vendorName');
        
        if (clientDropdownButtonText) {
            clientDropdownButtonText.textContent = 'Select a client...';
            clientDropdownButtonText.classList.remove('text-gray-900', 'dark:text-white');
            clientDropdownButtonText.classList.add('text-gray-500');
        }        
        if (clientHiddenInput) {
            clientHiddenInput.value = '';
        }
        
        if (vendorDropdownButtonText) {
            vendorDropdownButtonText.textContent = 'Select a vendor...';
            vendorDropdownButtonText.classList.remove('text-gray-900', 'dark:text-white');
            vendorDropdownButtonText.classList.add('text-gray-500');
        }        
        if (vendorHiddenInput) {
            vendorHiddenInput.value = '';
        }
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
            if (element) {
                element.value = field.value || '';
            }
        });
        
        // Handle client and vendor dropdowns separately
        const clientDropdownButtonText = document.getElementById('clientDropdownButtonText');
        const clientHiddenInput = document.getElementById('clientName');
        const vendorDropdownButtonText = document.getElementById('vendorDropdownButtonText');
        const vendorHiddenInput = document.getElementById('vendorName');
        
        if (operation.client_name && clientDropdownButtonText && clientHiddenInput) {
            clientDropdownButtonText.textContent = operation.client_name;
            clientDropdownButtonText.classList.remove('text-gray-500');
            clientDropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
            clientHiddenInput.value = operation.client_name;
        }
        
        if (operation.vendor_name && vendorDropdownButtonText && vendorHiddenInput) {
            vendorDropdownButtonText.textContent = operation.vendor_name;
            vendorDropdownButtonText.classList.remove('text-gray-500');
            vendorDropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
            vendorHiddenInput.value = operation.vendor_name;
        }
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
            this.showToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
            return false;
        }
        
        return true;
    }
    
    async generateOperationNumber() {
        try {
            const response = await fetch('/ajax/operations/generate-id', {
                headers: this.headers,
                credentials: 'same-origin' // Include session cookies
            });
            
            if (response.ok) {
                const result = await response.json();
                const operationNumField = document.getElementById('operationNum');
                if (operationNumField) {
                    operationNumField.value = result.operation_num;
                }
            }
        } catch (error) {
            console.error('Error generating operation number:', error);
        }
    }

    // ============================================================================
    // Utility Functions
    // ============================================================================

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB');
    }

    formatDateTime(dateTimeStr) {
        if (!dateTimeStr) return '';
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-GB');
    }

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

    showLoadingSpinner() {
        const tbody = document.getElementById('operationsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="18" class="px-4 py-8 text-center">
                        <div class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading operations...
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    hideLoadingSpinner() {
        // The loading spinner will be replaced when renderOperationsTable() is called
    }

    showToast(message, type = 'info') {
        // Use Flowbite Toast component
        const toastId = 'toast-' + Date.now();
        const icons = {
            success: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>`,
            error: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`,
            warning: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
            info: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>`
        };
        
        const colors = {
            success: 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200',
            error: 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200',
            warning: 'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200',
            info: 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200'
        };

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 fixed top-5 right-5 z-50`;
        toast.innerHTML = `
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 ${colors[type]} rounded-lg">
                ${icons[type]}
            </div>
            <div class="ml-3 text-sm font-normal">${message}</div>
            <button type="button" class="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" onclick="document.getElementById('${toastId}').remove()">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Initialize the operations manager when DOM is ready
let operationsManager;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        operationsManager = new OperationsManager();
    });
} else {
    operationsManager = new OperationsManager();
}
