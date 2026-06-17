import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from database import db

# Import blueprints
from routes.auth import auth_bp
from routes.student import student_bp
from routes.faculty import faculty_bp
from routes.tpc import tpc_bp
from routes.common import common_bp

def create_app():
    app = Flask(__name__)
    
    # Configure CORS - allow all origins for development and local testing
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'ipers-dev-jwt-super-secret-key-129381')
    
    # Configure DB URI: check for DATABASE_URL first
    database_url = os.environ.get('DATABASE_URL')
    
    if database_url:
        # standard postgres:// -> postgresql:// translation if needed for sqlalchemy
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    else:
        # Default fallback to SQLite
        instance_path = os.path.join(app.root_path, 'instance')
        os.makedirs(instance_path, exist_ok=True)
        db_path = os.path.join(instance_path, 'ipers.db')
        app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
        
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize DB
    db.init_app(app)
    
    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(faculty_bp, url_prefix='/api/faculty')
    app.register_blueprint(tpc_bp, url_prefix='/api/tpc')
    app.register_blueprint(common_bp, url_prefix='/api/common')
    
    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': 'postgresql' if os.environ.get('DATABASE_URL') else 'sqlite-fallback'
        }), 200
        
    # Create tables
    with app.app_context():
        db.create_all()
        
    return app

if __name__ == '__main__':
    app = create_app()
    # Run on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
