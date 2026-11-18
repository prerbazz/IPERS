import io
from flask import Blueprint, request, jsonify, g, send_file
from database import db
from models import StudentProfile, Company
from routes.auth import login_required, roles_required
from data_mining import (
    run_decision_tree_eligibility,
    cluster_companies_kmeans,
    run_knn_similar_profiles,
    generate_improvement_suggestions
)

student_bp = Blueprint('student', __name__)

@student_bp.route('/profile', methods=['PUT'])
@login_required
@roles_required('student')
def update_profile():
    student = g.user.student_profile
    if not student:
        return jsonify({'message': 'Student profile not found'}), 404
        
    data = request.get_json() or {}
    
    # Update fields
    if 'full_name' in data:
        student.full_name = data['full_name']
    if 'roll_number' in data:
        # Check if roll number already exists for another user
        existing = StudentProfile.query.filter(
            StudentProfile.roll_number == data['roll_number'],
            StudentProfile.id != student.id
        ).first()
        if existing:
            return jsonify({'message': 'Roll number already in use'}), 400
        student.roll_number = data['roll_number']
        
    # If student changes cgpa or internship count, reset verification status
    if 'cgpa' in data:
        new_cgpa = float(data['cgpa'])
        if new_cgpa != student.cgpa:
            student.cgpa = new_cgpa
            student.cgpa_verified = False
            
    if 'internships' in data:
        new_internships = int(data['internships'])
        if new_internships != student.internships:
            student.internships = new_internships
            student.internships_verified = False
            
    if 'arrears' in data:
        student.arrears = int(data['arrears'])
        
    if 'skills' in data:
        # If it's a list, join it with commas
        if isinstance(data['skills'], list):
            student.skills = ', '.join(data['skills'])
        else:
            student.skills = str(data['skills'])
            
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'profile': student.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update profile: {str(e)}'}), 500

@student_bp.route('/resume', methods=['POST'])
@login_required
@roles_required('student')
def upload_resume():
    student = g.user.student_profile
    if not student:
        return jsonify({'message': 'Student profile not found'}), 404
        
    if 'resume' not in request.files:
        return jsonify({'message': 'No file part in the request'}), 400
        
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'message': 'No file selected for uploading'}), 400
        
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({'message': 'Only PDF resumes are allowed'}), 400
        
    try:
        # Read the file data in binary form
        file_data = file.read()
        
        student.resume_data = file_data
        student.resume_name = file.filename
        student.resume_mime = 'application/pdf'
        
        db.session.commit()
        return jsonify({
            'message': 'Resume uploaded successfully',
            'resume_name': file.filename
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to upload resume: {str(e)}'}), 500

@student_bp.route('/resume/<int:student_id>', methods=['GET'])
@login_required
def download_resume(student_id):
    student = StudentProfile.query.get_or_404(student_id)
    
    # Access control: Student can only view their own; Faculty and TPC can view anyone's
    if g.user.role == 'student' and g.user.student_profile.id != student.id:
        return jsonify({'message': 'Access denied: unauthorized resume fetch'}), 403
        
    if not student.resume_data:
        return jsonify({'message': 'Resume not found for this student'}), 404
        
    return send_file(
        io.BytesIO(student.resume_data),
        download_name=student.resume_name or 'resume.pdf',
        mimetype=student.resume_mime or 'application/pdf',
        as_attachment=True
    )

@student_bp.route('/analyze-opportunities', methods=['GET'])
@login_required
@roles_required('student')
def analyze_opportunities():
    student = g.user.student_profile
    if not student:
        return jsonify({'message': 'Student profile not found'}), 404
        
    # Get all active companies
    companies = Company.query.filter_by(status='Open').all()

    # 1. Run Decision Tree Eligibility Check
    eligible_companies, ineligible_companies = run_decision_tree_eligibility(student, companies)
    
    # 2. Run K-Means Clustering on all companies (active + reference if needed)
    # We load all open and closed companies to get complete cluster representations
    all_companies = Company.query.all()
    cluster_assignments = {}
    if all_companies:
        cluster_assignments = cluster_companies_kmeans(all_companies)
        
    # Map K-Means clusters to eligible recommendations
    for item in eligible_companies:
        comp_id = item['company']['id']
        assigned_cluster = cluster_assignments.get(comp_id, 'General Placements')
        item['company']['cluster_type'] = assigned_cluster
        
        # Why Recommended rationale
        if assigned_cluster == "High CGPA + High Aptitude":
            item['why_recommended'] = "Recommended due to your stellar academic standing (high CGPA) and strong analytical/aptitude foundation."
        elif assigned_cluster == "Technical Skill Focused Companies":
            item['why_recommended'] = "Recommended based on your solid technical evaluation scores and practical internship background."
        else:
            item['why_recommended'] = "Recommended for general placements and consulting roles matching your qualifications."
            
    # 3. Run KNN Similar Profile Match (compares against historical placements)
    similar_students = run_knn_similar_profiles(student, k=3)
    
    # 4. Generate Improvement Suggestions based on ineligible parameters
    suggestions = generate_improvement_suggestions(student, ineligible_companies)
    
    return jsonify({
        'student_profile': student.to_dict(),
        'eligible_companies': eligible_companies,
        'ineligible_companies': ineligible_companies,
        'similar_students': similar_students,
        'improvement_suggestions': suggestions
    }), 200
