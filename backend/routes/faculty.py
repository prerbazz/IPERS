from flask import Blueprint, request, jsonify, g
from database import db
from models import StudentProfile
from routes.auth import login_required, roles_required
import pandas as pd

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

@faculty_bp.route('/students/evaluation/bulk', methods=['POST'])
@login_required
@roles_required('faculty')
def bulk_update_evaluations():
    if 'file' not in request.files:
        return jsonify({'message': 'Please upload a score sheet file.'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected for uploading.'}), 400

    filename = file.filename.lower()
    try:
        if filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif filename.endswith('.xlsx'):
            df = pd.read_excel(file, engine='openpyxl')
        else:
            return jsonify({'message': 'Unsupported file format. Upload a CSV or XLSX file.'}), 400
    except Exception as e:
        return jsonify({'message': f'Could not parse file: {str(e)}'}), 400

    required_columns = {'roll_number'}
    if not required_columns.issubset(set(df.columns.str.lower())):
        return jsonify({'message': 'The uploaded sheet must include a roll_number column.'}), 400

    score_columns = {
        'aptitude_score': 'aptitude_score',
        'technical_score': 'technical_score',
        'communication_score': 'communication_score'
    }

    updated = 0
    errors = []
    df.columns = [c.strip().lower() for c in df.columns]

    for idx, row in df.iterrows():
        roll_number = str(row.get('roll_number', '')).strip()
        if not roll_number:
            errors.append(f'Row {idx + 2}: Missing roll number')
            continue

        student = StudentProfile.query.filter_by(roll_number=roll_number).first()
        if not student:
            errors.append(f'Row {idx + 2}: Student with roll number {roll_number} not found')
            continue

        try:
            for field, key in score_columns.items():
                if key in row and pd.notna(row[key]):
                    score = int(row[key])
                    if score < 0 or score > 100:
                        raise ValueError(f'{field} must be 0-100')
                    setattr(student, field, score)
            updated += 1
        except Exception as exam:
            errors.append(f'Row {idx + 2}: {str(exam)}')

    try:
        db.session.commit()
        return jsonify({
            'message': f'Bulk score sheet processed successfully. {updated} student records updated.',
            'updated_count': updated,
            'errors': errors
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to save bulk updates: {str(e)}', 'errors': errors}), 500
