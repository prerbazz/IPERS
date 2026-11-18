import io
import csv
from flask import Blueprint, request, jsonify, g, Response
from database import db
from models import Company, Announcement, CompanyNews, StudentProfile
from routes.auth import login_required, roles_required

tpc_bp = Blueprint('tpc', __name__)

# Company Management CRUD

@tpc_bp.route('/companies', methods=['GET'])
@login_required
def get_companies():
    # Accessible to all logged in users so students can see them, but TPC manages them
    companies = Company.query.all()
    return jsonify([c.to_dict() for c in companies]), 200

@tpc_bp.route('/companies', methods=['POST'])
@login_required
@roles_required('tpc')
def create_company():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({'message': 'Company name is required'}), 400
        
    if Company.query.filter_by(name=name).first():
        return jsonify({'message': f'Company "{name}" already exists'}), 400
        
    try:
        company = Company(
            name=name,
            min_cgpa=float(data.get('min_cgpa', 0.0)),
            min_aptitude=int(data.get('min_aptitude', 0)),
            min_communication=int(data.get('min_communication', 0)),
            min_technical=int(data.get('min_technical', 0)),
            min_internships=int(data.get('min_internships', 0)),
            allowed_arrears=int(data.get('allowed_arrears', 0)),
            cluster_type=data.get('cluster_type'),
            status=data.get('status', 'Open')
        )
        db.session.add(company)
        db.session.commit()
        return jsonify({
            'message': 'Company created successfully',
            'company': company.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create company: {str(e)}'}), 500

@tpc_bp.route('/companies/<int:company_id>', methods=['PUT'])
@login_required
@roles_required('tpc')
def update_company(company_id):
    company = Company.query.get_or_404(company_id)
    data = request.get_json() or {}
    
    if 'name' in data:
        existing = Company.query.filter(Company.name == data['name'], Company.id != company.id).first()
        if existing:
            return jsonify({'message': 'Company name already in use'}), 400
        company.name = data['name']
        
    if 'min_cgpa' in data:
        company.min_cgpa = float(data['min_cgpa'])
    if 'min_aptitude' in data:
        company.min_aptitude = int(data['min_aptitude'])
    if 'min_communication' in data:
        company.min_communication = int(data['min_communication'])
    if 'min_technical' in data:
        company.min_technical = int(data['min_technical'])
    if 'min_internships' in data:
        company.min_internships = int(data['min_internships'])
    if 'allowed_arrears' in data:
        company.allowed_arrears = int(data['allowed_arrears'])
    if 'cluster_type' in data:
        company.cluster_type = data['cluster_type']
    if 'status' in data:
        if data['status'] not in ['Open', 'Closed']:
            return jsonify({'message': 'Status must be Open or Closed'}), 400
        company.status = data['status']
        
    try:
        db.session.commit()
        return jsonify({
            'message': 'Company updated successfully',
            'company': company.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to update company: {str(e)}'}), 500

@tpc_bp.route('/companies/<int:company_id>', methods=['DELETE'])
@login_required
@roles_required('tpc')
def delete_company(company_id):
    company = Company.query.get_or_404(company_id)
    try:
        db.session.delete(company)
        db.session.commit()
        return jsonify({'message': 'Company deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to delete company: {str(e)}'}), 500

# Report Generation
@tpc_bp.route('/eligibility-report', methods=['GET'])
@login_required
@roles_required('tpc')
def get_eligibility_report():
    students = StudentProfile.query.all()
    companies = Company.query.filter_by(status='Open').all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    header = ['Student Name', 'Roll Number', 'CGPA', 'Arrears', 'Internships', 'Aptitude', 'Technical', 'Communication']
    for c in companies:
        header.append(f"Eligible for {c.name}")
    writer.writerow(header)
    
    # Rows
    for s in students:
        row = [s.full_name, s.roll_number, s.cgpa, s.arrears, s.internships, s.aptitude_score, s.technical_score, s.communication_score]
        for c in companies:
            if s.placed:
                row.append('Placed')
                continue

            is_eligible = True
            if s.cgpa < c.min_cgpa: is_eligible = False
            if s.arrears > c.allowed_arrears: is_eligible = False
            if s.aptitude_score < c.min_aptitude: is_eligible = False
            if s.technical_score < c.min_technical: is_eligible = False
            if s.communication_score < c.min_communication: is_eligible = False
            if s.internships < c.min_internships: is_eligible = False
            
            row.append("Yes" if is_eligible else "No")
        writer.writerow(row)
        
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-disposition": "attachment; filename=eligibility_report.csv"}
    )

@tpc_bp.route('/placed-students', methods=['GET'])
@login_required
@roles_required('tpc')
def get_placed_students():
    placed = StudentProfile.query.filter_by(placed=True).all()
    return jsonify([s.to_dict() for s in placed]), 200

@tpc_bp.route('/students/mark-placed', methods=['POST'])
@login_required
@roles_required('tpc')
def mark_student_placed():
    data = request.get_json() or {}
    roll_number = data.get('roll_number', '').strip()
    placed_company = data.get('placed_company', '').strip()

    if not roll_number:
        return jsonify({'message': 'roll_number is required to mark placement.'}), 400

    student = StudentProfile.query.filter_by(roll_number=roll_number).first()
    if not student:
        return jsonify({'message': 'Student not found.'}), 404

    student.placed = True
    student.placed_company = placed_company or student.placed_company
    try:
        db.session.commit()
        return jsonify({'message': 'Student marked as placed.', 'student': student.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to mark student as placed: {str(e)}'}), 500

# Communications & News Management

@tpc_bp.route('/announcements', methods=['POST'])
@login_required
@roles_required('tpc')
def create_announcement():
    data = request.get_json() or {}
    title = data.get('title')
    content = data.get('content')
    
    if not title or not content:
        return jsonify({'message': 'Title and content are required'}), 400
        
    try:
        announcement = Announcement(
            title=title,
            content=content,
            created_by_id=g.user.id
        )
        db.session.add(announcement)
        db.session.commit()
        return jsonify({
            'message': 'Announcement created successfully',
            'announcement': announcement.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to create announcement: {str(e)}'}), 500

@tpc_bp.route('/company-news', methods=['POST'])
@login_required
@roles_required('tpc')
def create_company_news():
    data = request.get_json() or {}
    company_name = data.get('company_name')
    title = data.get('title')
    content = data.get('content')
    
    if not company_name or not title or not content:
        return jsonify({'message': 'Company name, title, and content are required'}), 400
        
    try:
        news = CompanyNews(
            company_name=company_name,
            title=title,
            content=content,
            created_by_id=g.user.id
        )
        db.session.add(news)
        db.session.commit()
        return jsonify({
            'message': 'Company news update posted successfully',
            'news': news.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Failed to post company news: {str(e)}'}), 500
