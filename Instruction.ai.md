# AI Worker Instructions: Frontend Module Refactoring

**Objective:** To refactor the remaining legacy JavaScript files (`bills.js`, `clients.js`, `vendors.js`, `expenses.js`, `payments.js`) into the modern, modular architecture.

**Core Principle:** The architectural pattern has been established and proven by the `operations` and `invoices` modules. Your task is to **replicate this pattern exactly**. Do not introduce new patterns or deviate from the existing structure. The goal is consistency and maintainability.

---

## 1. The Proven Template

The `operations` and `invoices` modules are your **gold standard**. Before starting, analyze their structure.

**Key Template Files to Reference:**
*   **Main Controller:** `static/js/operations.js`
*   **API Service:** `static/js/modules/OperationsApiService.js`
*   **Table Renderer:** `static/js/modules/OperationsTableRenderer.js`
*   **Modal Manager:** `static/js/modules/OperationsModalManager.js`
*   **Filter Manager:** `static/js/modules/OperationsFilterManager.js`
*   **Dropdown Manager:** `static/js/modules/OperationsDropdownManager.js`
*   **HTML Template:** `templates/operations.html`

**Shared Modules to REUSE (Do not recreate):**
*   `static/js/modules/apiService.js` (For shared data like clients, vendors)
*   `static/js/modules/toastManager.js` (For all user notifications)

---

## 2. Step-by-Step Refactoring Process

For each remaining module (e.g., "Bills"), follow these steps precisely.

### Step 0: Select a Module
Start with one module and complete its refactoring before moving to the next.
**Recommended Order:**
1.  Bills
2.  Clients
3.  Vendors
4.  Expenses
5.  Payments

### Step 1: Analyze the Legacy Module
For the module you are refactoring (e.g., "Bills"):
1.  **Read `static/js/<module_name>.js`** (e.g., `static/js/bills.js`): Identify all functionalities: data loading, event handlers, form submission logic, and any unique business rules.
2.  **Read `templates/<module_name>.html`** (e.g., `templates/bills.html`): Identify all relevant element IDs and classes for buttons, forms, tables, and modals.
3.  **Read `app/ajax/<module_name>_ajax.py`** (e.g., `app/ajax/bills_ajax.py`): Identify all API endpoints that the new API service will need to call.

### Step 2: Create the New JS Modules
In the `static/js/modules/` directory, create the following files. Use the `operations` and `invoices` modules as a direct template.

**Use the following naming convention:**
*   `<module_name>` = `bills`
*   `<ModuleName>` = `Bills`

1.  **` <ModuleName>ApiService.js `**
    *   **Purpose:** Handles all `fetch` requests to the backend for this module.
    *   **Action:** Create a class that mirrors `OperationsApiService.js`. It should have methods for `load<ModuleName>s`, `save<ModuleName>`, `delete<ModuleName>`, etc.

2.  **` <ModuleName>TableRenderer.js `**
    *   **Purpose:** Renders the data table.
    *   **Action:** Create a class that takes data and generates the HTML `<tr>` elements for the table body. It should handle data formatting and the creation of action buttons.

3.  **` <ModuleName>ModalManager.js `**
    *   **Purpose:** Manages the Add/Edit modal.
    *   **Action:** Create a class to control the modal's visibility, populate the form for editing, and handle form clearing. It should use the Flowbite library if present in the template.

4.  **` <ModuleName>FilterManager.js `**
    *   **Purpose:** Manages the filter controls.
    *   **Action:** Create a class to handle event listeners for filter inputs, collect filter values, and trigger a data refresh.

### Step 3: Overwrite the Main Controller
Go to `static/js/<module_name>.js` (e.g., `static/js/bills.js`) and **completely replace its contents** with a new main controller class.

*   **Purpose:** To orchestrate all the new modules.
*   **Action:** Create a `<ModuleName>Manager` class.
    1.  **Import** all the new modules you just created, plus the shared `apiService.js` and `toastManager.js`.
    2.  In the `constructor`, **instantiate** each module.
    3.  Create an `initialize` method to load initial data (like clients/vendors using the shared `apiService`) and perform the first data load for the module itself.
    4.  Create methods to handle events (e.g., `save<ModuleName>`, `delete<ModuleName>`), which will call the appropriate methods on your new modules.
    5.  Add a `DOMContentLoaded` event listener at the bottom of the file to create an instance of your new manager and call its `initialize` method.

### Step 4: Update the HTML Template
This is the final and most critical step to activate the new architecture.
1.  Open `templates/<module_name>.html` (e.g., `templates/bills.html`).
2.  Find the `<script>` tag that loads the JavaScript file for the page.
3.  **Change the tag to use `type="module"`**.

    **FROM:**
    ```html
    <script src="{{ url_for('static', filename='js/bills.js') }}"></script>
    ```

    **TO:**
    ```html
    <script type="module" src="{{ url_for('static', filename='js/bills.js') }}"></script>
    ```

---

## 3. Verification Checklist

For each module you refactor, ensure you can check off every item on this list:

- [ ] All original functionality from the legacy JS file has been successfully migrated.
- [ ] A new `<ModuleName>ApiService.js` has been created and handles all backend calls.
- [ ] A new `<ModuleName>TableRenderer.js` has been created and correctly renders the data.
- [ ] A new `<ModuleName>ModalManager.js` has been created and correctly manages the modal.
- [ ] A new `<ModuleName>FilterManager.js` has been created and correctly handles filtering.
- [ ] The main `<module_name>.js` file has been replaced with the new orchestrator class.
- [ ] The corresponding `<module_name>.html` template now loads the script with `type="module"`.
- [ ] All UI interactions (CRUD operations, filtering, sorting, notifications) are working as expected.

---

By following these instructions precisely, you will ensure that all remaining modules are brought up to the project's modern architectural standard.
