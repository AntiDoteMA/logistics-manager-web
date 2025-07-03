/**
 * Searchable Dropdown Manager
 *
 * Manages the behavior of a custom searchable dropdown component.
 * This component consists of a button, a hidden input, a dropdown menu with a search field, and a list of items.
 */
class SearchableDropdownManager {
    /**
     * @param {string} baseId - The base ID used to identify the dropdown's elements (e.g., 'clientFilter').
     * @param {function} onSelectionChange - Callback function that fires when a selection is made.
     */
    constructor(baseId, onSelectionChange = () => {}) {
        this.baseId = baseId;
        this.onSelectionChange = onSelectionChange;

        // DOM Elements
        this.button = document.getElementById(`${baseId}DropdownButton`);
        this.buttonText = document.getElementById(`${baseId}DropdownButtonText`);
        this.hiddenInput = document.getElementById(baseId);
        this.dropdownMenu = document.getElementById(`${baseId}Dropdown`);
        this.searchInput = document.getElementById(`${baseId}SearchInput`);
        this.list = document.getElementById(`${baseId}DropdownList`);

        this.originalButtonText = this.buttonText ? this.buttonText.textContent : 'Select';
        this.items = [];

        this._setupEventListeners();
    }

    _setupEventListeners() {
        if (!this.button || !this.dropdownMenu) return;

        // Toggle dropdown visibility
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.dropdownMenu.classList.toggle('hidden');
        });

        // Handle selection
        this.list.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li && li.dataset.value) {
                this.setValue(li.dataset.value, li.textContent);
                this.dropdownMenu.classList.add('hidden');
            }
        });

        // Handle search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => {
                this._filterItems(this.searchInput.value);
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.button.contains(e.target) && !this.dropdownMenu.contains(e.target)) {
                this.dropdownMenu.classList.add('hidden');
            }
        });
    }

    /**
     * Populates the dropdown list with items.
     * @param {Array<Object>} items - An array of objects, each with 'value' and 'text' properties.
     */
    populate(items) {
        this.items = items;
        this.list.innerHTML = ''; // Clear existing items

        if (items.length === 0) {
            this.list.innerHTML = `<li class="px-3 py-2 text-center text-gray-500">No items found</li>`;
            return;
        }

        items.forEach(item => {
            const li = document.createElement('li');
            li.className = 'px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer';
            li.dataset.value = item.value;
            li.textContent = item.text;
            this.list.appendChild(li);
        });
    }

    /**
     * Filters the displayed items based on a search term.
     * @param {string} searchTerm - The text to filter by.
     */
    _filterItems(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const listItems = this.list.getElementsByTagName('li');

        for (const item of listItems) {
            const itemText = item.textContent.toLowerCase();
            if (itemText.includes(lowerCaseSearchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        }
    }

    /**
     * Sets the value of the dropdown.
     * @param {string} value - The value to set on the hidden input.
     * @param {string} text - The text to display on the button.
     */
    setValue(value, text) {
        this.hiddenInput.value = value;
        this.buttonText.textContent = text;
        this.buttonText.classList.remove('text-gray-500');
        this.buttonText.classList.add('text-gray-900', 'dark:text-white');
        this.onSelectionChange(value);
    }

    /**
     * Gets the current value from the hidden input.
     * @returns {string}
     */
    getValue() {
        return this.hiddenInput.value;
    }

    /**
     * Resets the dropdown to its initial state.
     */
    reset() {
        this.hiddenInput.value = '';
        this.buttonText.textContent = this.originalButtonText;
        this.buttonText.classList.add('text-gray-500');
        this.buttonText.classList.remove('text-gray-900', 'dark:text-white');
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this._filterItems(''); // Show all items
    }
}

export default SearchableDropdownManager;
