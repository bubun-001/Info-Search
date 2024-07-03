# blueprints/book_types.py
from flask import Blueprint, request, jsonify
from models import db, BookType, Book
from sqlalchemy.exc import IntegrityError

book_types_blueprint = Blueprint('book_types', __name__)

# Add CRUD operations here
@book_types_blueprint.route('/book_types', methods=['POST'])
def add_book_type():
    """
    Adds a new book type to the database. Expects 'book_type_name' in the request JSON.
    Returns a success message with the new book type's ID or an error message if the book type already exists.
    """
    book_type_name = request.json.get('book_type_name')

    if not book_type_name:
        return jsonify({"error": "Book type name is required"}), 400
    
    try:
        new_book_type = BookType(book_type_name=book_type_name)
        db.session.add(new_book_type)
        db.session.commit()
        return jsonify({"success": True, "message": "Book type added successfully", "book_type_id": new_book_type.book_type_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Book type with this name already exists"}), 400
    
@book_types_blueprint.route('/book_types', methods=['GET'])
def get_book_types():
    """
    Retrieves all book types from the database and returns them in a JSON list.
    """
    book_types = BookType.query.all()
    return jsonify([{"book_type_id": book_type.book_type_id, "book_type_name": book_type.book_type_name} for book_type in book_types]), 200

@book_types_blueprint.route('/book_types/<int:book_type_id>', methods=['PUT'])
def update_book_type(book_type_id):
    """
    Updates the name of an existing book type specified by 'book_type_id'.
    Expects 'book_type_name' in the request JSON.
    Returns a success message if updated or an error if the book type does not exist or the new name conflicts.
    """
    book_type = BookType.query.get(book_type_id)

    if not book_type:
        return jsonify({"error": "Book type not found"}), 404

    book_type_name = request.json.get('book_type_name')
    if not book_type_name:
        return jsonify({"error": "Book type name is required"}), 400

    # Check if there are any books associated with this book type
    associated_books = Book.query.filter_by(book_type_id=book_type_id).all()
    if associated_books:
        return jsonify({"error": "Cannot update the book type as there are associated books"}), 400

    # Update the book type name
    book_type.book_type_name = book_type_name

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Book type updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This book type name already exists"}), 400

@book_types_blueprint.route('/book_types/<int:book_type_id>', methods=['DELETE'])
def delete_book_type(book_type_id):
    """
    Deletes a book type specified by 'book_type_id' from the database.
    Returns a success message if deleted or an error if the book type does not exist or cannot be deleted due to constraints.
    """
    book_type = BookType.query.get(book_type_id)

    if not book_type:
        return jsonify({"error": "Book type not found"}), 404

    # Check if there are any books associated with this book type
    associated_books = Book.query.filter_by(book_type_id=book_type_id).all()
    if associated_books:
        return jsonify({"error": "Cannot delete the book type as there are associated books"}), 400

    # Delete the book type
    db.session.delete(book_type)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Book type deleted successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error occurred during deletion"}), 400


