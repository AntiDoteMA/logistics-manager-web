// Custom JavaScript for Flowbite Admin Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first (before any other functionality)
    initializeTheme();
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize tooltips
    initializeTooltips();
      // Initialize animations
    initializeAnimations();
    initializeSidebarUserMenu();
    
    // Initialize sidebar toggle
    initializeSidebarToggle();
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeSelect = document.getElementById('theme-select');
    const saveButton = document.getElementById('save-general-settings');
    const htmlElement = document.documentElement;
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    
    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    // Apply current theme
    applyTheme(currentTheme);
    
    // Set theme select value if on settings page
    if (themeSelect) {
        themeSelect.value = currentTheme;
    }
    
    // Theme toggle button functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newTheme = htmlElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
            
            // Update select if on settings page
            if (themeSelect) {
                themeSelect.value = newTheme;
            }
            
            showNotification(`Theme changed to ${newTheme} mode`, 'success');
        });
    }
    
    // Settings page theme select functionality
    if (themeSelect) {
        themeSelect.addEventListener('change', function() {
            const selectedTheme = this.value;
            applyTheme(selectedTheme);
            localStorage.setItem('theme', selectedTheme);
            showNotification(`Theme preference updated to ${selectedTheme}`, 'info');
        });
    }
      // Save button functionality
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const hideLoading = showLoading(this);
            
            // Simulate saving (you can add actual API call here)
            setTimeout(() => {
                hideLoading();
                showNotification('Settings saved successfully!', 'success');
            }, 1000);
        });
    }    // Apply theme function
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            if (darkIcon) darkIcon.classList.remove('hidden');
            if (lightIcon) lightIcon.classList.add('hidden');
        } else if (theme === 'light') {
            htmlElement.classList.remove('dark');
            if (darkIcon) darkIcon.classList.add('hidden');
            if (lightIcon) lightIcon.classList.remove('hidden');
        } else if (theme === 'system') {
            // System theme detection
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (systemDark) {
                htmlElement.classList.add('dark');
                if (darkIcon) darkIcon.classList.remove('hidden');
                if (lightIcon) lightIcon.classList.add('hidden');
            } else {
                htmlElement.classList.remove('dark');
                if (darkIcon) darkIcon.classList.add('hidden');
                if (lightIcon) lightIcon.classList.remove('hidden');
            }
              // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (localStorage.getItem('theme') === 'system') {
                    if (e.matches) {
                        htmlElement.classList.add('dark');
                        if (darkIcon) darkIcon.classList.remove('hidden');
                        if (lightIcon) lightIcon.classList.add('hidden');
                    } else {
                        htmlElement.classList.remove('dark');
                        if (darkIcon) darkIcon.classList.add('hidden');
                        if (lightIcon) lightIcon.classList.remove('hidden');
                    }
                }            });
        }
    }
}

// Search Functionality
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"][placeholder*="Search"]');
    
    searchInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const table = e.target.closest('.bg-white, .dark\\:bg-gray-800')?.querySelector('table');
            
            if (table) {
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            }
        });
    });
}

// Mobile Menu Management
function initializeMobileMenu() {
    const mobileMenuButton = document.querySelector('[data-drawer-toggle="logo-sidebar"]');
    const sidebar = document.getElementById('logo-sidebar');
    const overlay = document.createElement('div');
    
    overlay.className = 'sidebar-overlay fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden hidden';
    document.body.appendChild(overlay);
    
    if (mobileMenuButton && sidebar) {
        mobileMenuButton.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
            overlay.classList.toggle('hidden');
        });
        
        overlay.addEventListener('click', function() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        });
    }
}

// Tooltip Initialization
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.classList.add('tooltip');
        
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 mb-2 z-50';
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.id = 'tooltip-' + Date.now();
            
            element.style.position = 'relative';
            element.appendChild(tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            const tooltip = element.querySelector('[id^="tooltip-"]');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}

// Animation Management
function initializeAnimations() {
    // Fade in elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.bg-white, .dark\\:bg-gray-800');
    animatedElements.forEach(el => observer.observe(el));
}

// Sidebar User Menu Dropdown (slide up animation)
function initializeSidebarUserMenu() {
    const btn = document.getElementById('sidebar-user-menu-btn');
    const dropdown = document.getElementById('sidebar-user-dropdown');
    const arrow = document.getElementById('sidebar-user-menu-arrow');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains('hidden');
        if (isOpen) {
            dropdown.classList.add('animate-slide-up-reverse');
            dropdown.classList.remove('animate-slide-up');
            setTimeout(() => {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('animate-slide-up-reverse');
            }, 200);
        } else {
            dropdown.classList.remove('hidden');
            dropdown.classList.add('animate-slide-up');
            dropdown.classList.remove('animate-slide-up-reverse');
        }
        if (arrow) {
            arrow.style.transform = isOpen ? '' : 'rotate(180deg)';
        }
    });
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.classList.contains('hidden')) {
            dropdown.classList.add('animate-slide-up-reverse');
            dropdown.classList.remove('animate-slide-up');
            setTimeout(() => {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('animate-slide-up-reverse');
            }, 200);
            if (arrow) arrow.style.transform = '';
        }
    });
    // Prevent closing when clicking inside dropdown
    dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Sidebar Toggle Functionality
function initializeSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('logo-sidebar');
    const mainContent = document.getElementById('main-content');
    
    // Check for saved sidebar state
    const sidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
    
    // Apply saved state on load
    if (sidebarState) {
        collapseSidebar();
    }
    
    // Toggle button functionality
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const isCollapsed = sidebar.classList.contains('-translate-x-full');
            
            if (isCollapsed) {
                expandSidebar();
                localStorage.setItem('sidebarCollapsed', 'false');
            } else {
                collapseSidebar();
                localStorage.setItem('sidebarCollapsed', 'true');
            }
        });
    }
    
    function collapseSidebar() {
        // Hide sidebar
        sidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('sm:translate-x-0');
        
        // Adjust main content
        mainContent.classList.remove('sm:ml-64');
        mainContent.classList.add('ml-0');
    }
    
    function expandSidebar() {
        // Show sidebar
        sidebar.classList.remove('-translate-x-full');
        sidebar.classList.add('sm:translate-x-0');
        
        // Adjust main content
        mainContent.classList.add('sm:ml-64');
        mainContent.classList.remove('ml-0');
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 640) { // sm breakpoint
            // On desktop, respect the stored preference
            const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            if (isCollapsed) {
                collapseSidebar();
            } else {
                expandSidebar();
            }
        }
    });
}

// Utility Functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">
                ${type === 'success' ? '<i class="fas fa-check-circle"></i>' :
                  type === 'error' ? '<i class="fas fa-exclamation-circle"></i>' :
                  type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' :
                  '<i class="fas fa-info-circle"></i>'}
            </span>
            <span>${message}</span>
            <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// Form Validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500');
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }
    });
    
    return isValid;
}

// Loading State Management
function showLoading(element) {
    const originalContent = element.innerHTML;
    element.innerHTML = '<span class="spinner inline-block mr-2"></span>Loading...';
    element.disabled = true;
    
    return function hideLoading() {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Data Table Functionality
function initializeDataTable(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;
    
    const headers = table.querySelectorAll('th[data-sort]');
    
    headers.forEach(header => {
        header.style.cursor = 'pointer';
        header.addEventListener('click', function() {
            const column = this.getAttribute('data-sort');
            const currentOrder = this.getAttribute('data-order') || 'asc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            
            // Reset all headers
            headers.forEach(h => {
                h.removeAttribute('data-order');
                h.querySelector('.sort-icon')?.remove();
            });
            
            // Set current header
            this.setAttribute('data-order', newOrder);
            const icon = document.createElement('i');
            icon.className = `fas fa-sort-${newOrder === 'asc' ? 'up' : 'down'} ml-2 sort-icon`;
            this.appendChild(icon);
            
            // Sort table rows
            sortTable(table, column, newOrder);
        });
    });
}

function sortTable(table, column, order) {
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    rows.sort((a, b) => {
        const aValue = a.cells[column].textContent.trim();
        const bValue = b.cells[column].textContent.trim();
        
        if (order === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    rows.forEach(row => tbody.appendChild(row));
}

// Export functions for global use
window.showNotification = showNotification;
window.confirmAction = confirmAction;
window.validateForm = validateForm;
window.showLoading = showLoading;
window.initializeDataTable = initializeDataTable;
