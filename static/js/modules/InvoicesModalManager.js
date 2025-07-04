/**
 * Invoices Modal Manager
 *
 * Manages the "Add/Edit Invoice" modal.
 */
class InvoicesModalManager {
    constructor({ onSave, clients = [], operations = [] }) {
        this.onSave = onSave;
        this.clients = clients;
        this.operations = operations;
        this.modalElement = document.getElementById('invoiceModal');
        if (!this.modalElement) {
            throw new Error('Modal element with ID "invoiceModal" not found.');
        }
        this.modal = null; // Initialize lazily
        this.form = document.getElementById('invoiceForm');
        this.title = document.getElementById('invoiceModalTitle');
        this.saveButton = document.getElementById('saveInvoiceBtn');
        this.currentInvoiceId = null;
        this.operationInputTimeout = null; // For debouncing operation input

        // Client dropdown elements
        this.clientDropdownButton = document.getElementById('clientModalDropdownButton');
        this.clientDropdownButtonText = document.getElementById('clientModalDropdownButtonText');
        this.clientDropdown = document.getElementById('clientModalDropdown');
        this.clientDropdownList = document.getElementById('clientModalDropdownList');
        this.clientSearchInput = document.getElementById('clientModalSearchInput');
        this.clientIdInput = document.getElementById('clientId');
        this.clientNameInput = document.getElementById('clientName');

        // Operation select elements
        this.operationNumInput = document.getElementById('operationNum');
        this.selectOperationBtn = document.getElementById('selectOperationBtn');

        this._setupEventListeners();
        
        // Try to initialize modal immediately, but don't fail if Flowbite isn't ready
        this._initModal();
    }

    /**
     * Updates the clients and operations data
     * @param {Array} clients - Array of client objects
     * @param {Array} operations - Array of operation objects
     */
    updateData(clients, operations) {
        this.clients = clients;
        this.operations = operations;
    }

    /**
     * Sets up event listeners for the modal.
     * @private
     */
    _setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(this.form);
            const data = Object.fromEntries(formData.entries());
            
            // Structure the products data as expected by the backend
            this.processProductsData(data);
            
            this.onSave(data, this.currentInvoiceId);
        });

        // Close button listeners
        const closeButtons = [
            document.getElementById('closeInvoiceModalBtn'),
            document.getElementById('closeInvoiceModalBtn2')
        ];

        closeButtons.forEach(button => {
            if (button) {
                button.addEventListener('click', () => this.close());
            }
        });

        // Close on backdrop click
        this.modalElement.addEventListener('click', (e) => {
            if (e.target === this.modalElement) {
                this.close();
            }
        });

        // Client dropdown event listeners
        this._setupClientDropdownListeners();

        // Operation selection event listeners
        this._setupOperationSelectionListeners();
    }

    /**
     * Sets up client dropdown event listeners
     * @private
     */
    _setupClientDropdownListeners() {
        if (!this.clientDropdownButton) return;

        // Toggle dropdown visibility
        this.clientDropdownButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.clientDropdown.classList.toggle('hidden');
            if (!this.clientDropdown.classList.contains('hidden')) {
                this._populateClientDropdown();
                this.clientSearchInput.focus();
            }
        });

        // Search functionality
        this.clientSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            this._filterClients(searchTerm);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.clientDropdownButton.contains(e.target) && !this.clientDropdown.contains(e.target)) {
                this.clientDropdown.classList.add('hidden');
            }
        });
    }

    /**
     * Sets up operation selection event listeners
     * @private
     */
    _setupOperationSelectionListeners() {
        if (!this.selectOperationBtn) return;

        this.selectOperationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this._showOperationSelector();
        });

        // Auto-fill functionality when operation number changes
        if (this.operationNumInput) {
            this.operationNumInput.addEventListener('change', (event) => {
                const operationNum = event.target.value.trim();
                if (operationNum) {
                    this.fetchOperationData(operationNum);
                }
            });

            // Also trigger on input (for manual typing)
            this.operationNumInput.addEventListener('input', (event) => {
                const operationNum = event.target.value.trim();
                // Only trigger after a short delay to avoid excessive requests
                clearTimeout(this.operationInputTimeout);
                this.operationInputTimeout = setTimeout(() => {
                    if (operationNum) {
                        this.fetchOperationData(operationNum);
                    }
                }, 500); // 500ms delay
            });
        }
    }

    /**
     * Populates the client dropdown with clients
     * @private
     */
    _populateClientDropdown() {
        if (!this.clientDropdownList || !this.clients.length) {
            this.clientDropdownList.innerHTML = '<li class="text-center py-2 text-gray-500 dark:text-gray-400">No clients available</li>';
            return;
        }

        this.clientDropdownList.innerHTML = '';
        this.clients.forEach(client => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center pl-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer py-2">
                    <label class="w-full py-2 ml-2 text-sm font-medium text-gray-900 rounded cursor-pointer dark:text-gray-300">
                        ${client.client_name || client.name || 'Unknown Client'}
                    </label>
                </div>
            `;
            
            li.addEventListener('click', () => {
                this._selectClient(client);
            });
            
            this.clientDropdownList.appendChild(li);
        });
    }

    /**
     * Filters clients based on search term
     * @param {string} searchTerm
     * @private
     */
    _filterClients(searchTerm) {
        const items = this.clientDropdownList.querySelectorAll('li');
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }

    /**
     * Selects a client and updates the form
     * @param {Object} client
     * @private
     */
    _selectClient(client) {
        const clientName = client.client_name || client.name || 'Unknown Client';
        this.clientDropdownButtonText.textContent = clientName;
        this.clientDropdownButtonText.classList.remove('text-gray-500');
        this.clientDropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
        
        this.clientIdInput.value = client.id || '';
        this.clientNameInput.value = clientName;
        
        this.clientDropdown.classList.add('hidden');
    }

    /**
     * Shows operation selector modal
     * @private
     */
    _showOperationSelector() {
        if (!this.operations.length) {
            alert('No operations available. Please create an operation first.');
            return;
        }

        // Get modal elements
        const selectionModal = document.getElementById('selectionModal');
        const selectionModalTitle = document.getElementById('selectionModalTitle');
        const selectionList = document.getElementById('selectionList');
        const selectionSearch = document.getElementById('selectionSearch');
        const closeSelectionModalBtn = document.getElementById('closeSelectionModalBtn');
        const closeSelectionModalBtn2 = document.getElementById('closeSelectionModalBtn2');

        if (!selectionModal || !selectionList) {
            // Fallback to simple prompt if modal not found
            this._showOperationSelectorPrompt();
            return;
        }

        // Set modal title
        selectionModalTitle.textContent = 'Select Operation';

        // Populate operations list
        this._populateOperationsList(selectionList, selectionSearch);

        // Show modal
        selectionModal.classList.remove('hidden');

        // Setup close handlers
        const closeModal = () => {
            selectionModal.classList.add('hidden');
            selectionSearch.value = '';
        };

        closeSelectionModalBtn.onclick = closeModal;
        closeSelectionModalBtn2.onclick = closeModal;

        // Close on backdrop click
        selectionModal.onclick = (e) => {
            if (e.target === selectionModal) {
                closeModal();
            }
        };
    }

    /**
     * Populates the operations list in the selection modal
     * @private
     */
    _populateOperationsList(selectionList, selectionSearch) {
        const renderOperations = (operations) => {
            selectionList.innerHTML = '';
            
            if (!operations.length) {
                selectionList.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400 py-4">No operations found</p>';
                return;
            }

            operations.forEach(operation => {
                const operationItem = document.createElement('div');
                operationItem.className = 'p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors';
                
                // Get status from is_confirmed boolean
                const status = operation.is_confirmed ? 'Confirmed' : 'Not Confirmed';
                const statusClass = operation.is_confirmed ? 'text-green-600' : 'text-yellow-600';
                
                operationItem.innerHTML = `
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="font-medium text-gray-900 dark:text-white">${operation.operation_num || 'N/A'}</div>
                            <div class="text-sm text-gray-500 dark:text-gray-400">
                                Client: ${operation.client_name || 'Unknown'} | Status: <span class="${statusClass}">${status}</span>
                            </div>
                            ${operation.description ? `<div class="text-xs text-gray-400 dark:text-gray-500 mt-1">${operation.description}</div>` : ''}
                        </div>
                        <div class="text-right">
                            <div class="text-sm text-gray-900 dark:text-white">${operation.operation_date || ''}</div>
                        </div>
                    </div>
                `;

                operationItem.addEventListener('click', () => {
                    this._selectOperation(operation);
                    document.getElementById('selectionModal').classList.add('hidden');
                });

                selectionList.appendChild(operationItem);
            });
        };

        // Initial render
        renderOperations(this.operations);

        // Setup search functionality
        selectionSearch.oninput = (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredOperations = this.operations.filter(op => 
                (op.operation_num || '').toLowerCase().includes(searchTerm) ||
                (op.client_name || '').toLowerCase().includes(searchTerm) ||
                (op.description || '').toLowerCase().includes(searchTerm) ||
                (op.vendor_name || '').toLowerCase().includes(searchTerm)
            );
            renderOperations(filteredOperations);
        };
    }

    /**
     * Selects an operation and updates the form
     * @param {Object} operation
     * @private
     */
    _selectOperation(operation) {
        if (this.operationNumInput) {
            this.operationNumInput.value = operation.operation_num || '';
            // Trigger auto-fill when operation is selected from the modal
            this.fetchOperationData(operation.operation_num);
        }
    }

    /**
     * Fetches operation data from the server and auto-fills the form
     * @param {string} operationNum - The operation number to fetch
     */
    async fetchOperationData(operationNum) {
        try {
            const response = await fetch(`/ajax/operations/${operationNum}`);
            if (!response.ok) {
                throw new Error('Failed to fetch operation data.');
            }
            const result = await response.json();
            if (result.success) {
                this.populateModalFields(result.data);
            } else {
                console.error('Error from server:', result.error);
            }
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    /**
     * Populates modal fields with operation data
     * @param {Object} data - The operation data
     */
    populateModalFields(data) {
        // Auto-fill client if available
        if (data.client_name && this.clientDropdownButtonText && this.clientNameInput) {
            this.clientDropdownButtonText.textContent = data.client_name;
            this.clientDropdownButtonText.classList.remove('text-gray-500');
            this.clientDropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
            this.clientNameInput.value = data.client_name;
            
            // Also set client ID if available
            if (data.client_id && this.clientIdInput) {
                this.clientIdInput.value = data.client_id;
            }
        }

        // Auto-fill operation date if available
        const operationDateInput = document.getElementById('operationDate');
        if (data.operation_date && operationDateInput) {
            // Convert date to YYYY-MM-DD format for date input
            const date = new Date(data.operation_date);
            if (!isNaN(date.getTime())) {
                operationDateInput.value = date.toISOString().split('T')[0];
            }
        }

        // Auto-fill operation-specific fields (not product-specific)
        const operationFieldMappings = {
            'description': data.description,
            'reference': data.reference  // This maps to the Reference field in Shipment Details
        };

        Object.entries(operationFieldMappings).forEach(([fieldId, value]) => {
            const field = document.getElementById(fieldId);
            if (field && value) {
                field.value = value;
            }
        });

        // Auto-fill shipper and receiver cities if we have sender field mapping
        if (data.shipper_city) {
            const senderField = document.getElementById('sender');
            if (senderField) {
                senderField.value = data.shipper_city;
            }
        }

        console.log('Auto-filled form with operation data:', data.operation_num);
    }

    /**
     * Processes and structures product data for backend submission
     * @param {Object} data - The form data object to modify
     */
    processProductsData(data) {
        // Create products array with the shipment details
        const products = [{
            refrence: data.refrence || "",
            sender: data.sender || "",
            merchandise: data.merchandise || "",
            incoterm: data.incoterm || "",
            operation_date: data.operation_date || "",
            arrival_date: data.arrival_date || "",
            trailern: data.trailern || "",
            n_pack: data.n_pack || "",
            gross_weight: data.gross_weight || ""
        }];

        // Add the structured products array to the data
        data.products = products;

        // Remove the individual product fields from the main data object
        // as they are now included in the products array
        delete data.refrence;
        delete data.sender;
        delete data.merchandise;
        delete data.incoterm;
        delete data.arrival_date;
        delete data.trailern;
        delete data.n_pack;
        delete data.gross_weight;

        console.log('Structured products data:', products);
    }

    /**
     * Fallback operation selector using prompt
     * @private
     */
    _showOperationSelectorPrompt() {
        const operationOptions = this.operations.map((op, index) => {
            const status = op.is_confirmed ? 'Confirmed' : 'Not Confirmed';
            return `${index + 1}. ${op.operation_num} - ${op.client_name || 'Unknown Client'} (${status})`;
        }).join('\n');

        const selection = prompt(
            `Select an operation by entering the number:\n\n${operationOptions}`,
            '1'
        );

        if (selection) {
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < this.operations.length) {
                const selectedOperation = this.operations[index];
                this.operationNumInput.value = selectedOperation.operation_num || '';
            } else {
                alert('Invalid selection. Please try again.');
            }
        }
    }

    /**
     * Initializes the Flowbite modal instance if it hasn't been already.
     * @private
     */
    _initModal() {
        if (!this.modal && typeof Modal !== 'undefined') {
            try {
                this.modal = new Modal(this.modalElement, {
                    placement: 'center',
                    backdrop: 'dynamic',
                    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                    closable: true,
                    onShow: () => this.modalElement.removeAttribute('aria-hidden'),
                    onHide: () => this.modalElement.setAttribute('aria-hidden', 'true')
                });
                console.log('Invoice modal initialized successfully');
            } catch (error) {
                console.error('Error initializing invoice modal:', error);
            }
        }
    }

    /**
     * Waits for Flowbite Modal to be available and initializes it
     * @private
     */
    _waitForModal() {
        return new Promise((resolve) => {
            const checkModal = () => {
                if (typeof Modal !== 'undefined') {
                    this._initModal();
                    resolve();
                } else {
                    setTimeout(checkModal, 50);
                }
            };
            checkModal();
        });
    }

    /**
     * Opens the modal to add a new invoice.
     */
    async openForAdd() {
        if (!this.modal) {
            await this._waitForModal();
        }
        if (!this.modal) {
            console.error('Cannot open modal: Modal not initialized');
            // Fallback: show modal without Flowbite
            this.modalElement.classList.remove('hidden');
            this._resetForm();
            return;
        }
        this.currentInvoiceId = null;
        this.title.textContent = 'Add Invoice';
        this._resetForm();
        this.modal.show();
    }

    /**
     * Opens the modal to edit an existing invoice.
     * @param {Object} invoice - The invoice data to populate the form with.
     */
    async openForEdit(invoice) {
        console.log('openForEdit called with invoice:', invoice); // Debug log
        
        if (!this.modal) {
            await this._waitForModal();
        }
        if (!this.modal) {
            console.error('Cannot open modal: Modal not initialized');
            // Fallback: show modal without Flowbite
            this.modalElement.classList.remove('hidden');
            this.currentInvoiceId = invoice.inv_id; // Use inv_id instead of id
            this.title.textContent = 'Edit Invoice';
            this._resetForm();
            this._populateForm(invoice);
            return;
        }
        
        console.log('Opening modal for edit, invoice ID:', invoice.inv_id); // Debug log
        this.currentInvoiceId = invoice.inv_id; // Use inv_id instead of id for backend operations
        this.title.textContent = 'Edit Invoice';
        this._resetForm();
        this._populateForm(invoice);
        this.modal.show();
    }

    /**
     * Closes the modal.
     */
    close() {
        if (this.modal) {
            this.modal.hide();
        } else {
            // Fallback: hide modal without Flowbite
            this.modalElement.classList.add('hidden');
        }
    }

    /**
     * Resets the form and dropdown states
     * @private
     */
    _resetForm() {
        this.form.reset();
        
        // Reset client dropdown
        if (this.clientDropdownButtonText) {
            this.clientDropdownButtonText.textContent = 'Select Client';
            this.clientDropdownButtonText.classList.remove('text-gray-900', 'dark:text-white');
            this.clientDropdownButtonText.classList.add('text-gray-500');
        }
        
        if (this.clientDropdown) {
            this.clientDropdown.classList.add('hidden');
        }
        
        // Clear hidden inputs
        if (this.clientIdInput) this.clientIdInput.value = '';
        if (this.clientNameInput) this.clientNameInput.value = '';
        if (this.operationNumInput) this.operationNumInput.value = '';
    }

    /**
     * Populates the form with invoice data.
     * @param {Object} invoice - The invoice data.
     * @private
     */
    _populateForm(invoice) {
        // First, populate standard fields
        for (const key in invoice) {
            const input = this.form.elements[key];
            if (input && key !== 'products') { // Skip products for special handling
                if (input.type === 'date' && invoice[key]) {
                    input.value = new Date(invoice[key]).toISOString().split('T')[0];
                } else {
                    input.value = invoice[key];
                }
            }
        }

        // Handle products data - decode base64 JSON and populate individual fields
        if (invoice.products) {
            try {
                let productsData;
                
                // Check if products is already an array (from frontend) or base64 string (from database)
                if (typeof invoice.products === 'string') {
                    // Decode base64 and parse JSON
                    const decodedProducts = atob(invoice.products);
                    productsData = JSON.parse(decodedProducts);
                } else if (Array.isArray(invoice.products)) {
                    productsData = invoice.products;
                }

                // If we have products data and it's an array with at least one item
                if (productsData && Array.isArray(productsData) && productsData.length > 0) {
                    const productData = productsData[0]; // Get first product data
                    
                    // Map product fields to form inputs
                    const productFieldMappings = {
                        'refrence': 'refrence',
                        'sender': 'sender', 
                        'merchandise': 'merchandise',
                        'incoterm': 'incoterm',
                        'arrival_date': 'arrival_date',
                        'trailern': 'trailern',
                        'n_pack': 'n_pack',
                        'gross_weight': 'gross_weight'
                    };

                    // Populate product fields
                    Object.entries(productFieldMappings).forEach(([productField, formField]) => {
                        const input = this.form.elements[formField];
                        if (input && productData[productField] !== undefined) {
                            if (input.type === 'date' && productData[productField]) {
                                input.value = new Date(productData[productField]).toISOString().split('T')[0];
                            } else {
                                input.value = productData[productField] || '';
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('Error parsing products data for editing:', error);
            }
        }

        // Update client dropdown if client is set
        if (invoice.client && this.clientDropdownButtonText) {
            this.clientDropdownButtonText.textContent = invoice.client;
            this.clientDropdownButtonText.classList.remove('text-gray-500');
            this.clientDropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
            
            if (this.clientNameInput) {
                this.clientNameInput.value = invoice.client;
            }
        }

        // Update client ID if available
        if (invoice.client_id && this.clientIdInput) {
            this.clientIdInput.value = invoice.client_id;
        }
    }
}

export default InvoicesModalManager;