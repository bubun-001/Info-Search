# blueprints/subtopics.py
from flask import Blueprint, request, jsonify
from models import db, SubTopic, Book, Topic
from sqlalchemy.exc import IntegrityError

subtopics_blueprint = Blueprint('subtopics', __name__)

@subtopics_blueprint.route('/subtopics', methods=['POST'])
def add_subtopic():
    """
    Adds a new subtopic to the database. Expects details of the subtopic including the names of the associated book 
    and topic, subtopic name, and URLs for the PDF and DOC versions in the request JSON.

    Input Parameters:
    - book_name: String representing the name of the book to which the subtopic belongs.
    - topic_name: String representing the name of the topic to which the subtopic belongs.
    - sub_topic_name: String representing the name of the subtopic.
    - sub_topic_url_pdf: String representing the URL of the PDF version of the subtopic.
    - sub_topic_url_doc: String representing the URL of the DOC version of the subtopic.

    Returns:
    - JSON object with success message and sub_topic_id of the newly added subtopic or an error message.
    """
    data = request.get_json()
    book_name = data.get('book_name')
    topic_name = data.get('topic_name')
    sub_topic_name = data.get('sub_topic_name')
    sub_topic_url_pdf = data.get('sub_topic_url_pdf')
    sub_topic_url_doc = data.get('sub_topic_url_doc')

    # Fetch the book and topic by names
    book = Book.query.filter_by(book_name=book_name).first()
    topic = Topic.query.filter_by(topic_name=topic_name).first()
    
    if not book or not topic:
        return jsonify({"error": "Book or Topic not found with the provided names"}), 404

    try:
        new_subtopic = SubTopic(
            topic_id=topic.topic_id,
            sub_topic_name=sub_topic_name,
            sub_topic_url_pdf=sub_topic_url_pdf,
            sub_topic_url_doc=sub_topic_url_doc
        )
        db.session.add(new_subtopic)
        db.session.commit()
        return jsonify({"success": True, "message": "SubTopic added successfully", "sub_topic_id": new_subtopic.sub_topic_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A SubTopic with this name already exists."}), 400

@subtopics_blueprint.route('/subtopics', methods=['GET'])
def get_subtopics():
    """
    Retrieves a list of all subtopics from the database along with their details including associated topic ID,
    subtopic name, and URLs for PDF and DOC versions.

    Returns:
    - JSON array containing the details of each subtopic.
    """
    subtopics = SubTopic.query.all()
    subtopics_data = [{
        "sub_topic_id": subtopic.sub_topic_id,
        "topic_id": subtopic.topic_id,
        "sub_topic_name": subtopic.sub_topic_name,
        "sub_topic_url_pdf": subtopic.sub_topic_url_pdf,
        "sub_topic_url_doc": subtopic.sub_topic_url_doc
    } for subtopic in subtopics]
    return jsonify(subtopics_data), 200

@subtopics_blueprint.route('/subtopics/<int:sub_topic_id>', methods=['PUT'])
def update_subtopic(sub_topic_id):
    """
    Updates an existing subtopic in the database. Accepts the subtopic ID as a parameter and updates its details 
    based on the provided JSON input. The function allows updating the subtopic's associated book, topic, name, 
    and URLs for PDF and DOC versions.

    Input Parameters:
    - sub_topic_id (URL Parameter): Integer ID of the subtopic to update.
    - book_name: (Optional) New name of the book the subtopic belongs to.
    - topic_name: (Optional) New name of the topic the subtopic belongs to.
    - sub_topic_name: (Optional) New name of the subtopic.
    - sub_topic_url_pdf: (Optional) New URL for the PDF version of the subtopic.
    - sub_topic_url_doc: (Optional) New URL for the DOC version of the subtopic.

    Returns:
    - JSON object with a success message if the update is successful or an error message otherwise.
    """
    subtopic = SubTopic.query.get(sub_topic_id)
    if not subtopic:
        return jsonify({"error": "SubTopic not found"}), 404

    data = request.get_json()
    book_name = data.get('book_name')
    topic_name = data.get('topic_name')
    book = Book.query.filter_by(book_name=book_name).first()
    topic = Topic.query.filter_by(topic_name=topic_name).first()

    if not book or not topic:
        return jsonify({"error": "Book or Topic not found with the provided names"}), 404

    subtopic.topic_id = topic.topic_id
    subtopic.sub_topic_name = data.get('sub_topic_name', subtopic.sub_topic_name)
    subtopic.sub_topic_url_pdf = data.get('sub_topic_url_pdf', subtopic.sub_topic_url_pdf)
    subtopic.sub_topic_url_doc = data.get('sub_topic_url_doc', subtopic.sub_topic_url_doc)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "SubTopic updated successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error updating the SubTopic."}), 400

@subtopics_blueprint.route('/subtopics/<int:sub_topic_id>', methods=['DELETE'])
def delete_subtopic(sub_topic_id):
    """
    Deletes a subtopic from the database based on its ID. 

    Input Parameters:
    - sub_topic_id (URL Parameter): Integer ID of the subtopic to delete.

    Returns:
    - JSON object with a success message if the subtopic is successfully deleted or an error message if the subtopic is not found.
    """
    subtopic = SubTopic.query.get(sub_topic_id)
    if not subtopic:
        return jsonify({"error": "SubTopic not found"}), 404

    db.session.delete(subtopic)
    db.session.commit()
    return jsonify({"success": True, "message": "SubTopic deleted successfully."}), 200

#To use this endpoint, the client (frontend) would make a GET request to 
#"/subtopics/by-topic?topic_name=SomeTopicName"
@subtopics_blueprint.route('/subtopics/by-topic', methods=['GET'])
def get_subtopics_by_topic():
    """
    Retrieves a list of subtopics for a given topic name. The topic name is passed as a query parameter.
    
    Input Parameters:
    - topic_name (Query Parameter): String representing the name of the topic.

    Returns:
    - JSON array containing the details of each subtopic under the specified topic or an error message if the topic is not found.
    """
    topic_name = request.args.get('topic_name')
    
    # Fetch the topic by name
    topic = Topic.query.filter_by(topic_name=topic_name).first()
    
    if not topic:
        return jsonify({"error": "Topic not found with the provided name"}), 404

    subtopics = SubTopic.query.filter_by(topic_id=topic.topic_id).all()
    subtopics_data = [{
        "sub_topic_id": subtopic.sub_topic_id,
        "topic_id": subtopic.topic_id,
        "sub_topic_name": subtopic.sub_topic_name,
        "sub_topic_url_pdf": subtopic.sub_topic_url_pdf,
        "sub_topic_url_doc": subtopic.sub_topic_url_doc
    } for subtopic in subtopics]

    return jsonify(subtopics_data), 200
