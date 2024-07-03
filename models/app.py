from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user
from werkzeug.security import generate_password_hash, check_password_hash
import models
from flask import request, jsonify
from werkzeug.security import check_password_hash
from models import db, User
from flask_jwt_extended import JWTManager, create_access_token
from flask_migrate import Migrate
from blueprints.grades import grades_blueprint
from blueprints.languages import languages_blueprint
from blueprints.book_type import book_types_blueprint
from blueprints.book_master import books_blueprint
from blueprints.topics import topics_blueprint
from blueprints.subtopics import subtopics_blueprint
from blueprints.embedding_types import embedding_types_blueprint
from blueprints.embedding_details import embedding_details_blueprint
from blueprints.scraper import scraper_blueprint
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins = 'http://localhost:3000')
app.secret_key = 'Aveti@educationalbooks_system'
app.config['JWT_SECRET_KEY'] = 'auth%key_for_embed'  # Add a separate secret key for JWT

# Setup the Flask-JWT-Extended extension
jwt = JWTManager(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    """
    This function is used by Flask-Login to load a user from the database.
    It takes a user ID and returns the corresponding User object.
    
    Args:
        user_id (int): The ID of the user to be loaded.

    Returns:
        User: The user object if found, otherwise None .
    """
    return models.User.query.get(int(user_id))

# Database configuration
# Update the below line with your PostgreSQL database URI
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Amartya%40123@localhost/postgres'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database with the Flask app
models.db.init_app(app)

migrate = Migrate(app, db)

# Register Blueprints
app.register_blueprint(grades_blueprint, url_prefix='/')
app.register_blueprint(languages_blueprint, url_prefix='/')
app.register_blueprint(book_types_blueprint, url_prefix='/api')
app.register_blueprint(books_blueprint, url_prefix='/api')
app.register_blueprint(topics_blueprint, url_prefix='/api')
app.register_blueprint(subtopics_blueprint, url_prefix='/api')
app.register_blueprint(embedding_types_blueprint, url_prefix='/api')
app.register_blueprint(embedding_details_blueprint, url_prefix='/api')
app.register_blueprint(scraper_blueprint, url_prefix='/api')

@app.cli.command('create-db')
def create_db():
    """
    A custom CLI command to create database tables based on SQLAlchemy models.
    This function creates all the tables defined in the models module.
    """
    """Create the database tables."""
    models.db.create_all()
    print("Database tables created.")


@app.route('/')
def index():
    return "Hello, world! The app is running."

@app.route('/api/register', methods=['POST'])
def register():
    """
    API endpoint for registering a new user. It accepts a useremail and password,
    checks for uniqueness of the useremail, hashes the password, and stores the new user in the database.

    Input is expected in JSON format containing 'useremail' and 'password'.

    Returns:
        JSON: A success or error message.
    """
    # Extract useremail and password from the request
    useremail = request.json.get('useremail')  # Changed from 'useremail' to 'useremail'
    plain_text_password = request.json.get('password')
    
    # Check if the useremail already exists
    existing_user = models.User.query.filter_by(user_email=useremail).first()
    if existing_user:
        return jsonify({"success": False, "message": "Useremail already exists."}), 400

    # Hash the password
    hashed_password = generate_password_hash(plain_text_password)

    # Create a new user instance
    new_user = models.User(user_email=useremail, user_password=hashed_password)

    # Add new user to the database
    models.db.session.add(new_user)
    models.db.session.commit()

    return jsonify({"success": True, "message": "User registered successfully."}), 201

@app.route('/api/login', methods=['POST'])
def login():
    """
    API endpoint for user login. It checks the user's credentials,
    and if valid, returns a JWT access token.

    Input is expected in JSON format containing 'useremail' and 'password'.

    Returns:
        JSON: A JWT access token for successful login or an error message.
    """
    # Extract the useremail and password from the request body
    useremail = request.json.get('useremail')  # Changed from 'useremail' to 'useremail'
    password = request.json.get('password')

    # Query the database for the user
    user = User.query.filter_by(user_email=useremail).first()

    # Check if the user exists and the password is correct
    if user and check_password_hash(user.user_password, password):
        # Create JWT token
        access_token = create_access_token(identity=useremail)
        return jsonify(access_token=access_token), 200
    
    # If credentials are invalid
    return jsonify({"success": False, "message": "Invalid credentials."}), 401



from sqlalchemy import text  # Import the text function

@app.route('/test-database')
def test_database_connection():
    try:
        # Use text() to declare the SQL statement as a text object
        stmt = text('SELECT 1')
        # Execute the SQL statement using the database session
        result = db.session.execute(stmt)

        # Extract the first column from the first row of the result set
        value = result.scalar()
        
        # Check if the value is equal to 1
        if value == 1:
            return jsonify({'message': 'Database connection successful'})
        else:
            return jsonify({'error': 'Database connection error', 'message': 'Unexpected result returned from the database'}), 500
    except Exception as e:
        return jsonify({'error': 'Database connection error', 'message': str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)

