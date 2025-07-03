/**
 * Invoices Filter Manager
 *
 * Manages the filtering functionality for the invoices page, including searchable dropdowns.
 */
import SearchableDropdownManager from './SearchableDropdownManager.js';

class InvoicesFilterManager {
    constructor({ onFilterChange }) {
        this.onFilterChange = onFilterChange;

        // Initialize searchable dropdowns
        this.clientFilter = new SearchableDropdownManager('clientFilter');
        this.statusFilter = new SearchableDropdownManager('statusFilter');

        // Standard input fields
        this.dateFromFilter = document.getElementById('dateFromFilter');
        this.dateToFilter = document.getElementById('dateToFilter');
        this.invoiceIdFilter = document.getElementById('invoiceIdFilter');
        this.searchInput = document.getElementById('searchInput');

        // Buttons
        this.applyFiltersBtn = document.getElementById('applyFiltersBtn');
        this.resetFiltersBtn = document.getElementById('resetFiltersBtn');

        this._setupEventListeners();
    }

    /**
     * Sets up the event listeners for the filter controls.
     * @private
     */
    _setupEventListeners() {
        this.applyFiltersBtn.addEventListener('click', () => this.onFilterChange(this.getFilters()));
        this.resetFiltersBtn.addEventListener('click', () => this.reset());
    }

    /**
     * Populates the client filter dropdown.
     * @param {Array<Object>} clients - Array of client objects.
     */
    populateClientFilter(clients) {
        const clientItems = clients.map(client => ({
            value: client.name, // The backend filters by name
            text: client.name,
        }));
        this.clientFilter.populate([{ value: '', text: 'All Clients' }, ...clientItems]);
    }

    /**
     * Populates the status filter dropdown.
     */
    populateStatusFilter() {
        const statusItems = [
            { value: '', text: 'All Status' },
            { value: 'draft', text: 'Draft' },
            { value: 'confirmed', text: 'Confirmed' },
            { value: 'registered', text: 'Registered' },
            { value: 'paid', text: 'Paid' },
            { value: 'consolidated', text: 'Consolidated' },
            { value: 'cancelled', text: 'Cancelled' },
        ];
        this.statusFilter.populate(statusItems);
    }

    /**
     * Gets the current filter values from all controls.
     * @returns {Object} The current filter criteria.
     */
    getFilters() {
        const filters = {
            client: this.clientFilter.getValue(),
            status: this.statusFilter.getValue(),
            date_from: this.dateFromFilter.value,
            date_to: this.dateToFilter.value,
            inv_id: this.invoiceIdFilter.value,
            search: this.searchInput.value,
        };
        // Remove empty filters
        return Object.fromEntries(Object.entries(filters).filter(([_, v]) => v != null && v !== ''));
    }

    /**
     * Resets all filter controls to their default values and triggers a filter change.
     */
    reset() {
        this.clientFilter.reset();
        this.statusFilter.reset();
        this.dateFromFilter.value = '';
        this.dateToFilter.value = '';
        this.invoiceIdFilter.value = '';
        this.searchInput.value = '';
        this.onFilterChange(this.getFilters());
    }
}

export default InvoicesFilterManager;
