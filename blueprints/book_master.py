# blueprints/books.py
from flask import Blueprint, request, jsonify
from models import db, Book,Grade,Topic,EmbeddingDetail,BookType, Language
from sqlalchemy.exc import IntegrityError
import models

books_blueprint = Blueprint('books', __name__)

@books_blueprint.route('/books', methods=['POST'])
def add_book():
    """
    Adds a new book to the database. Expects details of the book including grade name, book type name,
    language name, book name, and book URL in the request JSON. 
    If related entities (grade, book type, language) are found in the database, it creates and saves the book record.

    Input Parameters:
    - grade_name: String representing the name of the grade.
    - book_type_name: String representing the name of the book type.
    - lang_name: String representing the name of the language.
    - book_name: String representing the name of the book.
    - book_url: String representing the URL of the book.

    Returns:
    - JSON object with success message and book_id of the newly added book or an error message.
    """
    data = request.get_json()

    # Retrieve the grade, language, and book type by names
    grade = Grade.query.filter_by(grade_name=data['grade_name']).first()
    book_type = models.BookType.query.filter_by(book_type_name=data['book_type_name']).first()
    language = models.Language.query.filter_by(lang_name=data['lang_name']).first()

    # Check if all entities exist
    if not grade or not book_type or not language:
        return jsonify({
            "error": "Grade, book type, or language not found. Please ensure they exist in the database."
        }), 400

    try:
        new_book = Book(
            grade_id=grade.grade_id,
            book_type_id=book_type.book_type_id,
            book_name=data['book_name'],
            book_url=data['book_url'],
            lang_id=language.lang_id
        )
        db.session.add(new_book)
        db.session.commit()
        return jsonify({
            "success": True,
            "message": "Book added successfully.",
            "book_id": new_book.book_id
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A book with this name already exists."}), 400
    
@books_blueprint.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """
    Updates an existing book in the database. Accepts the book ID as a parameter and updates its details based
    on the provided JSON input. The function allows updating the book's grade, type, language, name, and URL.

    Input Parameters:
    - book_id (URL Parameter): Integer ID of the book to update.
    - grade_name: (Optional) New grade name.
    - book_type_name: (Optional) New book type name.
    - lang_name: (Optional) New language name.
    - book_name: (Optional) New book name.
    - book_url: (Optional) New book URL.

    Returns:
    - JSON object with a success message if the update is successful or an error message otherwise.
    """
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    data = request.get_json()
    grade = Grade.query.filter_by(grade_name=data.get('grade_name')).first()
    book_type = BookType.query.filter_by(book_type_name=data.get('book_type_name')).first()
    language = Language.query.filter_by(lang_name=data.get('lang_name')).first()

    if not grade or not book_type or not language:
        return jsonify({
            "error": "Grade, book type, or language not found. Please ensure they exist in the database."
        }), 400

    # Check if the update will cause dependency issues
    if Topic.query.filter_by(book_id=book_id).count() > 0:
        return jsonify({"error": "Cannot update the book as it has associated topics"}), 400

    try:
        book.grade_id = grade.grade_id
        book.book_type_id = book_type.book_type_id
        book.lang_id = language.lang_id
        book.book_name = data.get('book_name', book.book_name)
        book.book_url = data.get('book_url', book.book_url)
        db.session.commit()
        return jsonify({"success": True, "message": "Book updated successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error updating the book."}), 400

    
@books_blueprint.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """
    Deletes a book from the database based on its ID. 

    Input Parameters:
    - book_id (URL Parameter): Integer ID of the book to delete.

    Returns:
    - JSON object with a success message if the book is successfully deleted or an error message if the book is not found
      or if it has associated topics or embedding details.
    """
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    # Check if the book has associated topics or embedding details
    if Topic.query.filter_by(book_id=book_id).count() > 0:
        return jsonify({"error": "Cannot delete the book as it has associated topics."}), 400

    # If there are no associated topics or embedding details, proceed with deletion
    db.session.delete(book)
    db.session.commit()
    return jsonify({"success": True, "message": "Book deleted successfully."}), 200



@books_blueprint.route('/books', methods=['GET'])
def get_books():
    """
    Retrieves a list of all books from the database along with their details including grade name, book type name,
    and language name.

    Returns:
    - JSON array containing the details of each book.
    """
    books = Book.query.all()
    books_data = [{
        "book_id": book.book_id,
        "grade_name": Grade.query.get(book.grade_id).grade_name,
        "book_type_name": models.BookType.query.get(book.book_type_id).book_type_name,
        "book_name": book.book_name,
        "book_url": book.book_url,
        "language_name": models.Language.query.get(book.lang_id).lang_name
    } for book in books]
    return jsonify(books_data), 200

@books_blueprint.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    """
    Retrieves details of a specific book by its ID including the associated grade name, book type name, 
    and language name.

    Input Parameters:
    - book_id (URL Parameter): Integer ID of the book to retrieve.

    Returns:
    - JSON object containing the details of the book or an error message if the book is not found.
    """
    book = Book.query.get(book_id)
    if not book:
        return jsonify({"error": "Book not found"}), 404

    book_data = {
        "book_id": book.book_id,
        "grade_name": Grade.query.get(book.grade_id).grade_name,
        "book_type_name": models.BookType.query.get(book.book_type_id).book_type_name,
        "book_name": book.book_name,
        "book_url": book.book_url,
        "language_name": models.Language.query.get(book.lang_id).lang_name
    }
    return jsonify(book_data), 200


