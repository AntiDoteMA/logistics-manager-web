class OperationsModalManager {
    constructor() {
        this.operationModal = null;
        this.deleteModal = null;
        this.confirmModal = null;
    }

    initializeModals() {
        const operationModalEl = document.getElementById('operationModal');
        const deleteModalEl = document.getElementById('deleteModal');
        const confirmModalEl = document.getElementById('confirmModal');

        if (typeof Modal !== 'undefined' && operationModalEl) {
            this.operationModal = new Modal(operationModalEl, {
                placement: 'center',
                backdrop: 'dynamic',
                backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                closable: true,
                onShow: () => operationModalEl.removeAttribute('aria-hidden'),
                onHide: () => operationModalEl.setAttribute('aria-hidden', 'true')
            });
            
            if (deleteModalEl) {
                this.deleteModal = new Modal(deleteModalEl, {
                    placement: 'center',
                    backdrop: 'dynamic',
                    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                    closable: true,
                    onShow: () => deleteModalEl.removeAttribute('aria-hidden'),
                    onHide: () => deleteModalEl.setAttribute('aria-hidden', 'true')
                });
            }
            
            if (confirmModalEl) {
                this.confirmModal = new Modal(confirmModalEl, {
                    placement: 'center',
                    backdrop: 'dynamic',
                    backdropClasses: 'bg-gray-900 bg-opacity-50 dark:bg-opacity-80 fixed inset-0 z-40',
                    closable: true,
                    onShow: () => confirmModalEl.removeAttribute('aria-hidden'),
                    onHide: () => confirmModalEl.setAttribute('aria-hidden', 'true')
                });
            }

            console.log('Operations modals initialized successfully');
        }
    }

    showModal(modalType) {
        switch(modalType) {
            case 'operation':
                if (this.operationModal) this.operationModal.show();
                break;
            case 'delete':
                if (this.deleteModal) this.deleteModal.show();
                break;
            case 'confirm':
                if (this.confirmModal) this.confirmModal.show();
                break;
        }
    }

    hideModal(modalType) {
        switch(modalType) {
            case 'operation':
                if (this.operationModal) this.operationModal.hide();
                break;
            case 'delete':
                if (this.deleteModal) this.deleteModal.hide();
                break;
            case 'confirm':
                if (this.confirmModal) this.confirmModal.hide();
                break;
        }
    }
}

export default OperationsModalManager;