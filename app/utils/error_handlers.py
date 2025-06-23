"""
Error Handlers
Central error handling for the application
"""

from flask import request, jsonify, flash, redirect, url_for
import logging

logger = logging.getLogger(__name__)

def register_error_handlers(app):
    """Register error handlers for the application"""
    
    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized access"""
        if request.path.startswith('/api/') or request.path.startswith('/ajax/'):
            return jsonify({'error': 'Unauthorized'}), 401
        else:
            flash('Please log in to access this page', 'error')
            return redirect(url_for('auth.login'))

    @app.errorhandler(403)
    def forbidden(error):
        """Handle forbidden access"""
        if request.path.startswith('/api/') or request.path.startswith('/ajax/'):
            return jsonify({'error': 'Insufficient permissions'}), 403
        else:
            flash('You do not have permission to access this page', 'error')
            return redirect(url_for('main.dashboard'))
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle not found errors"""
        if request.path.startswith('/api/') or request.path.startswith('/ajax/'):
            return jsonify({'error': 'Not found'}), 404
        else:
            flash('Page not found', 'error')
            return redirect(url_for('main.dashboard'))
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors"""
        logger.error(f"Internal server error: {error}")
        if request.path.startswith('/api/') or request.path.startswith('/ajax/'):
            return jsonify({'error': 'Internal server error'}), 500
        else:
            flash('An internal error occurred', 'error')
            return redirect(url_for('main.dashboard'))
