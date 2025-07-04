class OperationsTableRenderer {
    constructor() {
        this.operationsData = [];
    }

    setOperationsData(data) {
        this.operationsData = data;
    }

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
                    <button onclick="window.operationsManager.openEditModal('${operation.operation_num}')" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                            title="Edit Operation">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    ${!isConfirmed ? `
                    <button onclick="window.operationsManager.openConfirmModal('${operation.operation_num}')" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors duration-200"
                            title="Confirm Operation">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    ` : ''}
                    <button onclick="window.operationsManager.openDeleteModal('${operation.operation_num}')" 
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
        `;
        return row;
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
}

export default OperationsTableRenderer;