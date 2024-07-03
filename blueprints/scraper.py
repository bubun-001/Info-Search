# blueprints/scraper.py
from flask import Blueprint, request, jsonify
from models import db, Scraper, BookType, Book, Grade, Language
from sqlalchemy.exc import IntegrityError

scraper_blueprint = Blueprint('scraper', __name__)

@scraper_blueprint.route('/scrapers', methods=['POST'])
def add_scraper():
    """
    Endpoint to add a new scraper function path to the database.
    Associates the scraper with specific book, grade, and language.

    Input:
    - scrapper_function_path: File path to the scraper function.
    - book_name: Name of the book.

    Output:
    - JSON response indicating the success or failure of the operation.
    """
    data = request.get_json()

    book = Book.query.filter_by(book_name=data['book_name']).first()

    if  not book:
        return jsonify({"error": "Book type, book, grade, or language not found"}), 404

    try:
        new_scraper = Scraper(
            scrapper_function_path=data['scrapper_function_path'],
            book_id=book.book_id,
        )
        db.session.add(new_scraper)
        db.session.commit()
        return jsonify({"success": True, "message": "Scraper added successfully", "scraper_id": new_scraper.scrapper_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error adding the scraper"}), 400

# You can also add endpoints to update, delete, and retrieve scraper details as needed.
@scraper_blueprint.route('/scrapers/<int:scraper_id>', methods=['GET'])
def get_scraper(scraper_id):
    scraper = Scraper.query.get(scraper_id)
    if scraper:
        return jsonify({
            "scraper_id": scraper.scrapper_id,
            "scraper_function_path": scraper.scrapper_function_path,
            "book_id": scraper.book_id
        }), 200
    else:
        return jsonify({"error": "Scraper not found"}), 404
    
# Update a scraper by ID
@scraper_blueprint.route('/scrapers/<int:scraper_id>', methods=['PUT'])
def update_scraper(scraper_id):
    scraper = Scraper.query.get(scraper_id)
    if scraper:
        data = request.get_json()
        scraper.scrapper_function_path = data.get('scraper_function_path', scraper.scrapper_function_path)
        db.session.commit()
        return jsonify({"success": True, "message": "Scraper updated successfully"}), 200
    else:
        return jsonify({"error": "Scraper not found"}), 404

# Delete a scraper by ID
@scraper_blueprint.route('/scrapers/<int:scraper_id>', methods=['DELETE'])
def delete_scraper(scraper_id):
    scraper = Scraper.query.get(scraper_id)
    if scraper:
        db.session.delete(scraper)
        db.session.commit()
        return jsonify({"success": True, "message": "Scraper deleted successfully"}), 200
    else:
        return jsonify({"error": "Scraper not found"}), 404