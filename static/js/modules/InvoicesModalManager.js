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
        }
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
        if (!this.modal) {
            await this._waitForModal();
        }
        if (!this.modal) {
            console.error('Cannot open modal: Modal not initialized');
            // Fallback: show modal without Flowbite
            this.modalElement.classList.remove('hidden');
            this._populateForm(invoice);
            return;
        }
        this.currentInvoiceId = invoice.id;
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
        for (const key in invoice) {
            const input = this.form.elements[key];
            if (input) {
                if (input.type === 'date' && invoice[key]) {
                    input.value = new Date(invoice[key]).toISOString().split('T')[0];
                } else {
                    input.value = invoice[key];
                }
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
    }
}

export default InvoicesModalManager;