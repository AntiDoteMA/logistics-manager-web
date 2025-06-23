"""
AJAX module initialization
"""

from .operations_ajax import ajax_operations_bp
from .invoices_ajax import ajax_invoices_bp
from .bills_ajax import ajax_bills_bp
from .clients_ajax import ajax_clients_bp
from .vendors_ajax import ajax_vendors_bp

__all__ = [
    'ajax_operations_bp',
    'ajax_invoices_bp', 
    'ajax_bills_bp',
    'ajax_clients_bp',
    'ajax_vendors_bp'
]
