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
        // Toggle dropdown visibility
        this.clientDropdownButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.clientDropdown.classList.toggle('hidden');
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
        this.selectOperationBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this._showOperationModal();
        });
    }
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
            return;
        }
        this.currentInvoiceId = null;
        this.title.textContent = 'Add Invoice';
        this.form.reset();
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
        this.form.reset();
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
    }
}

export default InvoicesModalManager;