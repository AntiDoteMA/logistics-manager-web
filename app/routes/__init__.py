"""
Routes module initialization
"""

from .auth_routes import auth_bp
from .main_routes import main_bp
from .page_routes import pages_bp

__all__ = ['auth_bp', 'main_bp', 'pages_bp']
