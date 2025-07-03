/**
 * InvoicesFilterManager_v2.js
 * 
 * Simplified filter manager following the Operations pattern.
 * Handles dropdown UI only, filtering is done server-side.
 * 
 * @author AI Assistant
 * @date 2025-07-02
 * @version 2.0.0
 */

class InvoicesFilterManager {
    constructor(filterType) {
        this.filterType = filterType; // 'client' or 'status'
        this.data = [];
    }

    populateFilterDropdown(data) {
        this.data = data;
        const dropdownList = document.getElementById(`${this.filterType}FilterDropdownList`);
        if (!dropdownList) return;

        dropdownList.innerHTML = '';
        
        // Add "All" option
        const allLi = document.createElement('li');
        allLi.innerHTML = `
            <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.filterType}-filter-option" data-${this.filterType}-value="">
                <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">All ${this.filterType.charAt(0).toUpperCase() + this.filterType.slice(1)}s</span>
            </div>
        `;
        dropdownList.appendChild(allLi);

        // Add data options
        if (this.filterType === 'client') {
            const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
            sortedData.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.filterType}-filter-option" data-${this.filterType}-value="${item.id}">
                        <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${item.name}</span>
                    </div>
                `;
                dropdownList.appendChild(li);
            });
        } else if (this.filterType === 'status') {
            data.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.filterType}-filter-option" data-${this.filterType}-value="${item.value}">
                        <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${item.label}</span>
                    </div>
                `;
                dropdownList.appendChild(li);
            });
        }

        this.setupFilterDropdownEvents();
    }

    setupFilterDropdownEvents() {
        const searchInput = document.getElementById(`${this.filterType}FilterSearchInput`);
        const options = document.querySelectorAll(`.${this.filterType}-filter-option`);
        const dropdownButton = document.getElementById(`${this.filterType}FilterDropdownButton`);
        const dropdownButtonText = document.getElementById(`${this.filterType}FilterDropdownButtonText`);
        const hiddenInput = document.getElementById(`${this.filterType}Filter`);
        const dropdown = document.getElementById(`${this.filterType}FilterDropdown`);

        // Dropdown toggle
        if (dropdownButton && dropdown) {
            dropdownButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (dropdown.classList.contains('hidden')) {
                    dropdown.classList.remove('hidden');
                    if (searchInput) setTimeout(() => searchInput.focus(), 100);
                } else {
                    dropdown.classList.add('hidden');
                }
            });
        }

        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (dropdown && !dropdown.contains(e.target) && !dropdownButton.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                options.forEach(option => {
                    const text = option.textContent.toLowerCase();
                    const listItem = option.parentElement;
                    listItem.style.display = text.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }

        // Selection functionality
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute(`data-${this.filterType}-value`);
                const displayText = e.currentTarget.textContent.trim();
                
                dropdownButtonText.textContent = displayText;
                dropdownButtonText.classList.remove('text-gray-500');
                dropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
                hiddenInput.value = value;
                
                if (dropdown) dropdown.classList.add('hidden');
                if (searchInput) {
                    searchInput.value = '';
                    options.forEach(opt => opt.parentElement.style.display = 'block');
                }
                
                console.log(`Selected ${this.filterType} filter: ${displayText}`);
            });
        });
    }
}

// Make InvoicesFilterManager available globally and as ES6 export
window.InvoicesFilterManager = InvoicesFilterManager;
export default InvoicesFilterManager;
