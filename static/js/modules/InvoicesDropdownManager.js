/**
 * Invoices Dropdown Manager
 *
 * Manages the population of dropdown menus (select elements) for the invoices page.
 */
class InvoicesDropdownManager {
    /**
     * Populates a dropdown with the given data.
     * @param {string} dropdownId - The ID of the dropdown element.
     * @param {Array} data - The data to populate the dropdown with.
     * @param {Object} options - Configuration options.
     * @param {string} options.valueField - The field in the data to use for the option value.
     * @param {string} options.textField - The field in the data to use for the option text.
     * @param {string} [options.placeholder='Select an option'] - The placeholder text for the dropdown.
     */
    populateDropdown(dropdownId, data, { valueField, textField, placeholder = 'Select an option' }) {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) {
            console.error(`Dropdown with ID "${dropdownId}" not found.`);
            return;
        }

        dropdown.innerHTML = `<option value="">${placeholder}</option>`;

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueField];
            option.textContent = item[textField];
            dropdown.appendChild(option);
        });
    }
}

export default InvoicesDropdownManager;