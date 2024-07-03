# blueprints/embedding_types.py
from flask import Blueprint, request, jsonify
from models import db, EmbeddingType, EmbeddingDetail
from sqlalchemy.exc import IntegrityError

embedding_types_blueprint = Blueprint('embedding_types', __name__)

@embedding_types_blueprint.route('/embedding_types', methods=['POST'])
def add_embedding_type():
    """
    Adds a new embedding type to the database. Expects the name of the embedding type in the request JSON.
    
    Input Parameters:
    - embed_type: String representing the name of the embedding type.

    Returns:
    - JSON object with success message and the ID of the newly added embedding type or an error message if the embedding type already exists.
    """
    data = request.get_json()
    embed_type = data.get('embed_type')

    try:
        new_embedding_type = EmbeddingType(embed_type=embed_type)
        db.session.add(new_embedding_type)
        db.session.commit()
        return jsonify({"success": True, "message": "Embedding type added successfully", "embed_type_id": new_embedding_type.embed_type_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "This embedding type already exists."}), 400

@embedding_types_blueprint.route('/embedding_types', methods=['GET'])
def get_embedding_types():
    """
    Retrieves all embedding types from the database and returns them in a JSON list.

    Returns:
    - JSON array containing the details of each embedding type, including their IDs and names.
    """
    embedding_types = EmbeddingType.query.all()
    types_data = [{"embed_type_id": embed_type.embed_type_id, "embed_type": embed_type.embed_type} for embed_type in embedding_types]
    return jsonify(types_data), 200

@embedding_types_blueprint.route('/embedding_types/<int:embed_type_id>', methods=['PUT'])
def update_embedding_type(embed_type_id):
    """
    Updates the name of an existing embedding type in the database based on the provided embedding type ID.

    Input Parameters:
    - embed_type_id: Integer, ID of the embedding type to update.
    - embed_type: (Optional) New name of the embedding type.

    Returns:
    - JSON object with a success message if the update is successful or an error message if the embedding type is not found or if there's a conflict.
    """
    embedding_type = EmbeddingType.query.get(embed_type_id)
    if not embedding_type:
        return jsonify({"error": "Embedding type not found"}), 404

    data = request.get_json()
    new_embed_type_name = data.get('embed_type')
    
    if not new_embed_type_name:
        return jsonify({"error": "Embedding type name is required"}), 400

    # Check if there are any embedding details associated with this embedding type
    associated_embedding_details = EmbeddingDetail.query.filter_by(embed_id=embed_type_id).all()
    if associated_embedding_details:
        return jsonify({"error": "Cannot update the embedding type as there are associated embedding details"}), 400

    embedding_type.embed_type = new_embed_type_name

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Embedding type updated successfully."}), 200
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Error updating the embedding type."}), 400

@embedding_types_blueprint.route('/embedding_types/<int:embed_type_id>', methods=['DELETE'])
def delete_embedding_type(embed_type_id):
    """
    Deletes an embedding type from the database based on its ID.

    Input Parameters:
    - embed_type_id: Integer, ID of the embedding type to delete.

    Returns:
    - JSON object with a success message if the embedding type is successfully deleted or an error message if the embedding type is not found or if there are associated embedding details.
    """
    embedding_type = EmbeddingType.query.get(embed_type_id)
    if not embedding_type:
        return jsonify({"error": "Embedding type not found"}), 404

    # Check if there are any embedding details associated with this embedding type
    associated_embedding_details = EmbeddingDetail.query.filter_by(embed_id=embed_type_id).all()
    if associated_embedding_details:
        return jsonify({"error": "Cannot delete the embedding type as there are associated embedding details"}), 400

    db.session.delete(embedding_type)
    db.session.commit()
    return jsonify({"success": True, "message": "Embedding type deleted successfully."}), 200


