# blueprints/topics.py
from flask import Blueprint, request, jsonify
from models import db, Topic, Book, Grade, BookType, Language, EmbeddingDetail
from sqlalchemy.exc import IntegrityError

topics_blueprint = Blueprint('topics', __name__)

@topics_blueprint.route('/topics', methods=['POST'])
def add_topic():
    """
    Adds a new topic to the database. Expects details of the topic including book name, 
    topic name, and URLs for the PDF and DOC versions of the topic in the request JSON.
    
    Input Parameters:
    - book_name: String representing the name of the book the topic belongs to.
    - topic_name: String representing the name of the topic.
    - topic_url_pdf: String representing the URL of the PDF version of the topic.
    - topic_url_doc: String representing the URL of the DOC version of the topic.

    Returns:
    - JSON object with success message and topic_id of the newly added topic or an error message.
    """
    data = request.get_json()
    book_name = data.get('book_name')
    topic_name = data.get('topic_name')
    topic_url_pdf = data.get('topic_url_pdf')
    topic_url_doc = data.get('topic_url_doc')

    # Fetch the book ID from the given book name
    book = Book.query.filter_by(book_name=book_name).first()
    if not book:
        return jsonify({"error": "Book not found with the provided name"}), 404

    try:
        new_topic = Topic(
            book_id=book.book_id,
            topic_name=topic_name,
            topic_url_pdf=topic_url_pdf,
            topic_url_doc=topic_url_doc
        )
        db.session.add(new_topic)
        db.session.commit()
        return jsonify({"success": True, "message": "Topic added successfully", "topic_id": new_topic.topic_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A topic with this name already exists."}), 400

@topics_blueprint.route('/topics/<int:topic_id>', methods=['PUT'])
def update_topic(topic_id):
    """
    Updates an existing topic in the database. Accepts the topic ID as a parameter and updates 
    its details based on the provided JSON input. The function allows updating the topic's book, name, 
    and URLs for PDF and DOC versions.

    Input Parameters:
    - topic_id (URL Parameter): Integer ID of the topic to update.
    - book_name: (Optional) New name of the book the topic belongs to.
    - topic_name: (Optional) New name of the topic.
    - topic_url_pdf: (Optional) New URL for the PDF version of the topic.
    - topic_url_doc: (Optional) New URL for the DOC version of the topic.

    Returns:
    - JSON object with a success message if the update is successful or an error message otherwise.
    """
    topic = Topic.query.get(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    data = request.get_json()
    book_name = data.get('book_name')
    book = Book.query.filter_by(book_name=book_name).first()
    if not book:
        return jsonify({"error": "Book not found with the provided name"}), 404

    # Check if the update will cause dependency issues
    if EmbeddingDetail.query.filter_by(topic_id=topic_id).count() > 0:
        return jsonify({"error": "Cannot update the topic as it has associated embedding details"}), 400

    topic.book_id = book.book_id
    topic.topic_name = data.get('topic_name', topic.topic_name)
    topic.topic_url_pdf = data.get('topic_url_pdf', topic.topic_url_pdf)
    topic.topic_url_doc = data.get('topic_url_doc', topic.topic_url_doc)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Topic updated successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error updating the topic."}), 400

@topics_blueprint.route('/topics/<int:topic_id>', methods=['DELETE'])
def delete_topic(topic_id):
    """
    Deletes a topic from the database based on its ID. 

    Input Parameters:
    - topic_id (URL Parameter): Integer ID of the topic to delete.

    Returns:
    - JSON object with a success message if the topic is successfully deleted or an error message if the topic is not found
      or if it has associated embedding details.
    """
    topic = Topic.query.get(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    # Check if the topic has associated embedding details
    if EmbeddingDetail.query.filter_by(topic_id=topic_id).count() > 0:
        return jsonify({"error": "Cannot delete the topic as it has associated embedding details"}), 400

    db.session.delete(topic)
    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Topic deleted successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error occurred during deletion."}), 400


@topics_blueprint.route('/topics', methods=['GET'])
def get_topics():
    """
    Retrieves a list of all topics from the database along with their details including the associated book name 
    and URLs for PDF and DOC versions.

    Returns:
    - JSON array containing the details of each topic.
    """
    topics = Topic.query.all()
    topics_data = [{
        "topic_id": topic.topic_id,
        "book_name": Book.query.get(topic.book_id).book_name if Book.query.get(topic.book_id) else None,
        "book_details": get_book_details(topic.book_id),
        "topic_name": topic.topic_name,
        "topic_url_pdf": topic.topic_url_pdf,
        "topic_url_doc": topic.topic_url_doc
    } for topic in topics]
    return jsonify(topics_data), 200

@topics_blueprint.route('/topics/<int:topic_id>', methods=['GET'])
def get_topic(topic_id):
    """
    Retrieves details of a specific topic by its ID including the associated book name and URLs for PDF and DOC versions.

    Input Parameters:
    - topic_id (URL Parameter): Integer ID of the topic to retrieve.

    Returns:
    - JSON object containing the details of the topic or an error message if the topic is not found.
    """
    topic = Topic.query.get(topic_id)
    if not topic:
        return jsonify({"error": "Topic not found"}), 404

    book = Book.query.get(topic.book_id)
    topic_data = {
        "topic_id": topic.topic_id,
        "book_details": get_book_details(topic.book_id),
        "topic_name": topic.topic_name,
        "topic_url_pdf": topic.topic_url_pdf,
        "topic_url_doc": topic.topic_url_doc
    }
    return jsonify(topic_data), 200

def get_book_details(book_id):
    """
    Helper function to fetch additional details about the book such as grade name, book type name,
    and language name.

    Returns:
    - JSON object containing the details of the book.
    """
    book = Book.query.get(book_id)
    if not book:
        return None

    book_details = {
        "grade_name": Grade.query.get(book.grade_id).grade_name,
        "book_type_name": BookType.query.get(book.book_type_id).book_type_name,
        "language_name": Language.query.get(book.lang_id).lang_name
    }
    return book_details

