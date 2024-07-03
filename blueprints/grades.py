from flask import Blueprint, request, jsonify
from models import db, Grade, Book
from sqlalchemy.exc import IntegrityError


grades_blueprint = Blueprint('grades', __name__)

@grades_blueprint.route('/api/grades', methods=['POST'])
def add_grade():
    """
    API endpoint to add a new grade. It accepts a grade name and creates a new grade record in the database.
    
    Input:
    - grade_name (str): The name of the grade to add.

    Returns:
    - JSON response indicating success or failure of the grade addition.
    """
    grade_name = request.json.get('grade_name')

    if not grade_name:
        return jsonify({"error": "Grade name is required"}), 400
    
    try:
        new_grade = Grade(grade_name=grade_name)
        db.session.add(new_grade)
        db.session.commit()
        return jsonify({"success": True, "message": "Grade added successfully", "grade_id": new_grade.grade_id}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Grade with this name already exists"}), 400

#retrieb=ving grades
@grades_blueprint.route('/api/grades', methods=['GET'])
def get_grades():
    """
    API endpoint to retrieve all grades. It returns a list of all grades in the database.

    Returns:
    - JSON response containing a list of grades with their IDs and names.
    """
    grades = Grade.query.all()
    return jsonify([{"grade_id": grade.grade_id, "grade_name": grade.grade_name} for grade in grades]), 200

@grades_blueprint.route('/api/grades/<int:grade_id>', methods=['PUT'])
def update_grade(grade_id):
    """
    API endpoint to update an existing grade. It accepts a grade ID and a new name for the grade.
    
    Args:
    - grade_id (int): The ID of the grade to update.

    Input:
    - grade_name (str): The new name of the grade.

    Returns:
    - JSON response indicating success or failure of the grade update.
    """
    grade = Grade.query.get(grade_id)
    
    if not grade:
        return jsonify({"error": "Grade not found"}), 404

    grade_name = request.json.get('grade_name')
    if not grade_name:
        return jsonify({"error": "Grade name is required"}), 400

    # Check if there are any books associated with this grade
    associated_books = Book.query.filter_by(grade_id=grade_id).all()
    if associated_books:
        return jsonify({"error": "Cannot update the grade as there are associated books"}), 400

    grade.grade_name = grade_name

    db.session.commit()
    return jsonify({"success": True, "message": "Grade updated successfully"}), 200

@grades_blueprint.route('/api/grades/<int:grade_id>', methods=['DELETE'])
def delete_grade(grade_id):
    """
    API endpoint to delete an existing grade. It accepts a grade ID and removes the corresponding grade from the database.
    
    Args:
    - grade_id (int): The ID of the grade to delete.

    Returns:
    - JSON response indicating success or failure of the grade deletion.
    """
    grade = Grade.query.get(grade_id)
    
    if not grade:
        return jsonify({"error": "Grade not found"}), 404

    # Check if there are any books associated with this grade
    associated_books = Book.query.filter_by(grade_id=grade_id).all()
    if associated_books:
        return jsonify({"error": "Cannot delete the grade as there are associated books"}), 400

    db.session.delete(grade)
    db.session.commit()
    return jsonify({"success": True, "message": "Grade deleted successfully"}), 200


