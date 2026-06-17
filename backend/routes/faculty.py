from flask import Blueprint, request, jsonify, g
from database import db
from models import StudentProfile
from routes.auth import login_required, roles_required

faculty_bp = Blueprint('faculty', __name__)

@faculty_bp.route('/students', methods=['GET'])
@login_required
@roles_required('faculty')
def search_students():
    query_param = request.args.get('q', '').strip()
    
    # Base query
    query = StudentProfile.query
    
    if query_param:
        # Search by name or roll number
        search_filter = (StudentProfile.full_name.ilike(f'%{query_param}%')) | \
                        (StudentProfile.roll_number.ilike(f'%{query_param}%'))
        query = query.filter(search_filter)
        
    students = query.all()
    return jsonify([s.to_dict() for s in students]), 200

@faculty_bp.route('/students/<int:student_id>', methods=['GET'])
@login_required
@roles_required('faculty', 'tpc')
def get_student_details(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    return jsonify(student.to_dict()), 200

@faculty_bp.route('/students/<int:student_id>/evaluation', methods=['PUT'])
@login_required
@roles_required('faculty')
def update_evaluation(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    data = request.get_json() or {}
    
    # Update evaluation scores
    if 'aptitude_score' in data:
        score = int(data['aptitude_score'])
        if not (0 <= score <= 100):
            return jsonify({'message': 'Aptitude score must be between 0 and 100'}), 400
        student.aptitude_score = score
        
    if 'communication_score' in data:
        score = int(data['communication_score'])
        if not (0 <= score <= 100):
            return jsonify({'message': 'Communication score must be between 0 and 100'}), 400
        student.communication_score = score
        
    if 'technical_score' in data:
        score = int(data['technical_score'])
        if not (0 <= score <= 100):
            return jsonify({'message': 'Technical score must be between 0 and 100'}), 400
        student.technical_score = score
        
    # Verification updates
    if 'cgpa_verified' in data:
        student.cgpa_verified = bool(data['cgpa_verified'])
        
    if 'internships_verified' in data:
        student.internships_verified = bool(data['internships_verified'])
        
    try:
        db.session.commit()
        return jsonify({
            'message': 'Evaluation and verification status updated successfully',
            'profile': student.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update evaluation: {str(e)}'}), 500
