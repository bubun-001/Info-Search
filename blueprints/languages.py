# blueprints/languages.py
from flask import Blueprint, request, jsonify
from models import db, Language, Book
from sqlalchemy.exc import IntegrityError

languages_blueprint = Blueprint('languages', __name__)

# Add CRUD operations here
@languages_blueprint.route('/api/languages', methods=['POST'])
def add_language():
    """
    Adds a new language to the database. Expects 'lang_name' in the request JSON.
    Returns a success message with the new language's ID or an error message if the language already exists.
    """

    lang_name = request.json.get('lang_name')

    if not lang_name:
        return jsonify({"error": "Language name is required"}), 400
    
    try:
        new_lang = Language(lang_name=lang_name)
        db.session.add(new_lang)
        db.session.commit()
        return jsonify({"success": True, "message": "Language added successfully", "lang_id": new_lang.lang_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Language with this name already exists"}), 400
    
@languages_blueprint.route('/api/languages', methods=['GET'])
def get_languages():
    """
    Retrieves all languages from the database and returns them in a JSON list.
    """

    languages = Language.query.all()
    return jsonify([{"lang_id": lang.lang_id, "lang_name": lang.lang_name} for lang in languages]), 200

@languages_blueprint.route('/api/languages/<int:lang_id>', methods=['PUT'])
def update_language(lang_id):
    """
    Updates the name of an existing language specified by 'lang_id'.
    Expects 'lang_name' in the request JSON.
    Returns a success message if updated or an error if the language does not exist or the new name conflicts.
    """
    lang = Language.query.get(lang_id)

    if not lang:
        return jsonify({"error": "Language not found"}), 404

    lang_name = request.json.get('lang_name')
    if not lang_name:
        return jsonify({"error": "Language name is required"}), 400

    # Check if there are any books associated with this language
    associated_books = Book.query.filter_by(lang_id=lang_id).all()
    if associated_books:
        return jsonify({"error": "Cannot update the language as there are associated books"}), 400

    lang.lang_name = lang_name

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Language updated successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This language name already exists"}), 400

@languages_blueprint.route('/api/languages/<int:lang_id>', methods=['DELETE'])
def delete_language(lang_id):
    """
    Deletes a language specified by 'lang_id' from the database.
    Returns a success message if deleted or an error if the language does not exist or cannot be deleted due to constraints.
    """
    lang = Language.query.get(lang_id)

    if not lang:
        return jsonify({"error": "Language not found"}), 404

    # Check if there are any books associated with this language
    associated_books = Book.query.filter_by(lang_id=lang_id).all()
    if associated_books:
        return jsonify({"error": "Cannot delete the language as there are associated books"}), 400

    db.session.delete(lang)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Language deleted successfully"}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error occurred during deletion"}), 400


