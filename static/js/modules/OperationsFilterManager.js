class OperationsFilterManager {
    constructor(filterType) {
        this.filterType = filterType; // 'client' or 'vendor'
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
            <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.filterType}-filter-option" data-${this.filterType}-name="">
                <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">All ${this.filterType.charAt(0).toUpperCase() + this.filterType.slice(1)}s</span>
            </div>
        `;
        dropdownList.appendChild(allLi);

        // Add data options
        const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));
        sortedData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.filterType}-filter-option" data-${this.filterType}-name="${item.name}">
                    <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${item.name}</span>
                </div>
            `;
            dropdownList.appendChild(li);
        });

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
                    const name = option.getAttribute(`data-${this.filterType}-name`)?.toLowerCase() || '';
                    const listItem = option.parentElement;
                    listItem.style.display = name.includes(searchTerm) || name === '' ? 'block' : 'none';
                });
            });
        }

        // Selection functionality
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const name = e.currentTarget.getAttribute(`data-${this.filterType}-name`);
                const displayText = name || `All ${this.filterType.charAt(0).toUpperCase() + this.filterType.slice(1)}s`;
                
                dropdownButtonText.textContent = displayText;
                dropdownButtonText.classList.remove('text-gray-500');
                dropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
                hiddenInput.value = name;
                
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

export default OperationsFilterManager;