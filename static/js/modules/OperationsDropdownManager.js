class OperationsDropdownManager {
    constructor(dropdownType) {
        this.dropdownType = dropdownType; // 'client' or 'vendor'
        this.data = [];
    }

    populateDropdown(data) {
        this.data = data;
        const dropdownList = document.getElementById(`${this.dropdownType}DropdownList`);
        if (!dropdownList) return;

        dropdownList.innerHTML = '';
        data.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="flex items-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer ${this.dropdownType}-option" 
                     data-${this.dropdownType}-id="${item.id}" 
                     data-${this.dropdownType}-name="${item.name}">
                    <span class="w-full text-sm font-medium text-gray-900 dark:text-gray-300">${item.name}</span>
                </div>
            `;
            dropdownList.appendChild(li);
        });

        this.setupDropdownEvents();
    }

    setupDropdownEvents() {
        const searchInput = document.getElementById(`${this.dropdownType}SearchInput`);
        const options = document.querySelectorAll(`.${this.dropdownType}-option`);
        const dropdownButton = document.getElementById(`${this.dropdownType}DropdownButton`);
        const dropdownButtonText = document.getElementById(`${this.dropdownType}DropdownButtonText`);
        const hiddenInput = document.getElementById(`${this.dropdownType}Name`);
        const dropdown = document.getElementById(`${this.dropdownType}Dropdown`);

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
                    const name = option.getAttribute(`data-${this.dropdownType}-name`).toLowerCase();
                    const listItem = option.parentElement;
                    listItem.style.display = name.includes(searchTerm) ? 'block' : 'none';
                });
            });
        }

        // Selection functionality
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute(`data-${this.dropdownType}-id`);
                const name = e.currentTarget.getAttribute(`data-${this.dropdownType}-name`);
                
                dropdownButtonText.textContent = name;
                dropdownButtonText.classList.remove('text-gray-500');
                dropdownButtonText.classList.add('text-gray-900', 'dark:text-white');
                hiddenInput.value = name;
                
                if (dropdown) dropdown.classList.add('hidden');
                if (searchInput) {
                    searchInput.value = '';
                    options.forEach(opt => opt.parentElement.style.display = 'block');
                }
                
                console.log(`Selected ${this.dropdownType}: ${name} (ID: ${id})`);
            });
        });
    }
}

export default OperationsDropdownManager;