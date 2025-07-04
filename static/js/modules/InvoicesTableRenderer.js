/**
 * Invoices Table Renderer
 *
 * Renders the table of invoices.
 * This module is responsible for generating the HTML for the invoice table rows.
 */
class InvoicesTableRenderer {
    constructor(tableBodyId) {
        this.tableBody = document.getElementById(tableBodyId);
    }

    /**
     * Renders the invoices in the table.
     * @param {Array} invoices - The array of invoice objects to render.
     * @param {Function} onAction - The callback function to execute when an action button is clicked.
     */
    render(invoices, onAction) {
        if (!this.tableBody) {
            console.error('Table body element not found.');
            return;
        }

        this.tableBody.innerHTML = '';

        if (invoices.length === 0) {
            this.tableBody.innerHTML = `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td colspan="19" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div class="flex flex-col items-center">
                            <svg class="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p class="text-lg font-medium">No invoices found</p>
                            <p class="text-sm">Create your first invoice to get started</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        invoices.forEach(invoice => {
            const row = this._createRow(invoice, onAction);
            this.tableBody.appendChild(row);
        });
    }

    /**
     * Creates a table row for a single invoice.
     * @param {Object} invoice - The invoice object.
     * @param {Function} onAction - The callback function for action buttons.
     * @returns {HTMLTableRowElement} The created table row element.
     * @private
     */
    _createRow(invoice, onAction) {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200';
        row.dataset.invoiceId = invoice.id;

        const formattedDate = date => date ? new Date(date).toLocaleDateString() : 'N/A';
        const daysLeft = invoice.due_date ? this._calculateDaysLeft(invoice.due_date) : 'N/A';

        // Status badge styling
        const getStatusBadge = (status) => {
            let statusClass = '';
            switch (status?.toLowerCase()) {
                case 'paid':
                    statusClass = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
                    break;
                case 'pending':
                    statusClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
                    break;
                case 'overdue':
                    statusClass = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                    break;
                case 'draft':
                    statusClass = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
                    break;
                default:
                    statusClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            }
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}">${status || 'Unknown'}</span>`;
        };

        row.innerHTML = `
            <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                    <button data-action="edit" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                            title="Edit Invoice">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button data-action="confirm" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-lg hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors duration-200"
                            title="Confirm Invoice">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </button>
                    <button data-action="delete" 
                            class="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
                            title="Delete Invoice">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-4 py-3"><input type="checkbox" class="invoice-checkbox w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"></td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${invoice.id}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">${invoice.inv_id}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.client || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.operation_num || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${formattedDate(invoice.inv_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${daysLeft}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${formattedDate(invoice.due_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.currency}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.description}</td>
            <td class="px-4 py-3">${getStatusBadge(invoice.status)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.payment_method || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${formattedDate(invoice.payment_date)}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.notes || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.total}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.tax_percentage || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${invoice.lastmodifiedby}</td>
            <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">${formattedDate(invoice.lastmodifieddate)}</td>
        `;

        row.querySelectorAll('button').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                onAction(action, invoice.id);
            });
        });

        return row;
    }

    /**
     * Calculates the number of days left until the due date.
     * @param {string} dueDateString - The due date in string format.
     * @returns {string} The number of days left or 'Overdue'.
     * @private
     */
    _calculateDaysLeft(dueDateString) {
        const dueDate = new Date(dueDateString);
        const today = new Date();
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Overdue by ${Math.abs(diffDays)} days</span>`;
        } else if (diffDays <= 7) {
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">${diffDays} days left</span>`;
        } else {
            return `<span class="text-sm text-gray-700 dark:text-gray-300">${diffDays} days</span>`;
        }
    }
}

export default InvoicesTableRenderer;
