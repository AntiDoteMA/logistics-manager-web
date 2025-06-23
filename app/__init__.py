"""
Flask Application Factory
Creates and configures the Flask application with modular structure
"""

from flask import Flask
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app(config_name='default'):
    """
    Application factory function
    Creates and configures Flask app with blueprints
    """
    app = Flask(__name__, 
                template_folder='../templates',
                static_folder='../static')    # Configure app
    app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key-here-change-in-production')
    
    # Session configuration - Fix cookie issues
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_PATH'] = '/'  # Ensure cookie works for all paths
    app.config['SESSION_COOKIE_DOMAIN'] = None  # Use default domain
    app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour
    
    # Additional session debugging
    import logging
    if app.debug:
        logging.getLogger('flask.sessions').setLevel(logging.DEBUG)
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Initialize authentication middleware
    from app.auth.auth_decorators import AuthMiddleware
    auth_middleware = AuthMiddleware(app)
    
    # Register blueprints
    register_blueprints(app)
    
    # Register error handlers
    register_error_handlers(app)
    
    return app

def register_blueprints(app):
    """Register all application blueprints"""
    
    # Auth routes
    from app.routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)
    
    # Main routes (dashboard, settings, etc.)
    from app.routes.main_routes import main_bp
    app.register_blueprint(main_bp)
      # Page routes (static pages)
    from app.routes.page_routes import pages_bp
    app.register_blueprint(pages_bp)
    
    # Debug routes (remove in production)
    from app.routes.debug_routes import debug_bp
    app.register_blueprint(debug_bp)    # AJAX endpoints
    from app.ajax.operations_ajax import ajax_operations_bp
    from app.ajax.invoices_ajax import ajax_invoices_bp
    from app.ajax.bills_ajax import ajax_bills_bp
    from app.ajax.clients_ajax import ajax_clients_bp
    from app.ajax.vendors_ajax import ajax_vendors_bp
    from app.ajax.expenses_ajax import ajax_expenses_bp
    from app.ajax.payments_ajax import ajax_payments_bp
    
    app.register_blueprint(ajax_operations_bp)
    app.register_blueprint(ajax_invoices_bp)
    app.register_blueprint(ajax_bills_bp)
    app.register_blueprint(ajax_clients_bp)
    app.register_blueprint(ajax_vendors_bp)
    app.register_blueprint(ajax_expenses_bp)
    app.register_blueprint(ajax_payments_bp)    # API blueprints (existing ones)
    from app.api.operations_api import operations_bp
    from app.api.invoice_api import invoice_bp
    from app.api.client_api import clients_bp
    from app.api.vendor_api import vendors_bp
    from app.api.bill_api import bill_bp
    from app.api.expense_api import expense_bp
    from app.api.payment_api import payment_bp
    
    app.register_blueprint(operations_bp)
    app.register_blueprint(invoice_bp)
    app.register_blueprint(clients_bp)
    app.register_blueprint(vendors_bp)
    app.register_blueprint(bill_bp)
    app.register_blueprint(expense_bp)
    app.register_blueprint(payment_bp)

def register_error_handlers(app):
    """Register error handlers"""
    from app.utils.error_handlers import register_error_handlers
    register_error_handlers(app)
