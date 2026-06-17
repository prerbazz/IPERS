from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from database import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'student', 'faculty', 'tpc'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    student_profile = db.relationship('StudentProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    faculty_profile = db.relationship('FacultyProfile', backref='user', uselist=False, cascade="all, delete-orphan")
    tpc_profile = db.relationship('TpcProfile', backref='user', uselist=False, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class StudentProfile(db.Model):
    __tablename__ = 'student_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    cgpa = db.Column(db.Float, default=0.0)
    internships = db.Column(db.Integer, default=0)
    
    # Resume fields (stored as binary in DB as requested)
    resume_data = db.Column(db.LargeBinary, nullable=True)
    resume_name = db.Column(db.String(255), nullable=True)
    resume_mime = db.Column(db.String(100), nullable=True)
    
    # Faculty evaluations & verifications
    aptitude_score = db.Column(db.Integer, default=0)       # 0 to 100
    communication_score = db.Column(db.Integer, default=0) # 0 to 100
    technical_score = db.Column(db.Integer, default=0)     # 0 to 100
    cgpa_verified = db.Column(db.Boolean, default=False)
    internships_verified = db.Column(db.Boolean, default=False)
    
    arrears = db.Column(db.Integer, default=0)
    skills = db.Column(db.String(500), default='')  # Comma separated list of skills
    
    def to_dict(self, include_resume=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'roll_number': self.roll_number,
            'cgpa': self.cgpa,
            'internships': self.internships,
            'has_resume': self.resume_data is not None,
            'resume_name': self.resume_name,
            'aptitude_score': self.aptitude_score,
            'communication_score': self.communication_score,
            'technical_score': self.technical_score,
            'cgpa_verified': self.cgpa_verified,
            'internships_verified': self.internships_verified,
            'arrears': self.arrears,
            'skills': [s.strip() for s in self.skills.split(',')] if self.skills else []
        }
        if include_resume and self.resume_data:
            import base64
            data['resume_base64'] = base64.b64encode(self.resume_data).decode('utf-8')
            data['resume_mime'] = self.resume_mime
        return data

class FacultyProfile(db.Model):
    __tablename__ = 'faculty_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name,
            'department': self.department
        }

class TpcProfile(db.Model):
    __tablename__ = 'tpc_profiles'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.name
        }

class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    min_cgpa = db.Column(db.Float, nullable=False, default=0.0)
    min_aptitude = db.Column(db.Integer, nullable=False, default=0)
    min_communication = db.Column(db.Integer, nullable=False, default=0)
    min_technical = db.Column(db.Integer, nullable=False, default=0)
    min_internships = db.Column(db.Integer, nullable=False, default=0)
    allowed_arrears = db.Column(db.Integer, nullable=False, default=0)
    cluster_type = db.Column(db.String(100), nullable=True)  # Populated dynamically by K-Means
    status = db.Column(db.String(20), nullable=False, default='Open')  # 'Open' or 'Closed'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'min_cgpa': self.min_cgpa,
            'min_aptitude': self.min_aptitude,
            'min_communication': self.min_communication,
            'min_technical': self.min_technical,
            'min_internships': self.min_internships,
            'allowed_arrears': self.allowed_arrears,
            'cluster_type': self.cluster_type or 'Unclustered',
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class Announcement(db.Model):
    __tablename__ = 'announcements'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to get the poster's name
    created_by_user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'created_by': self.created_by_user.username if self.created_by_user else 'System',
            'created_at': self.created_at.isoformat()
        }

class CompanyNews(db.Model):
    __tablename__ = 'company_news'
    
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    created_by_user = db.relationship('User')

    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'title': self.title,
            'content': self.content,
            'created_by': self.created_by_user.username if self.created_by_user else 'System',
            'created_at': self.created_at.isoformat()
        }
