from flask import Blueprint, request, jsonify, g, current_app
from functools import wraps
from itsdangerous import URLSafeSerializer, BadSignature
from database import db
from models import User, StudentProfile, FacultyProfile, TpcProfile

auth_bp = Blueprint('auth', __name__)

def get_serializer():
    return URLSafeSerializer(current_app.config['SECRET_KEY'], salt='auth-salt')

def generate_auth_token(user_id, role):
    s = get_serializer()
    return s.dumps({'user_id': user_id, 'role': role})

def verify_auth_token(token):
    s = get_serializer()
    try:
        data = s.loads(token)
        return data['user_id'], data['role']
    except (BadSignature, KeyError):
        return None, None

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'Authorization header is missing or malformed'}), 401
        
        token = auth_header.split(' ')[1]
        user_id, role = verify_auth_token(token)
        if not user_id:
            return jsonify({'message': 'Invalid or expired token'}), 401
            
        user = User.query.get(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 401
            
        g.user = user
        g.role = role
        return f(*args, **kwargs)
    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'role') or g.role not in roles:
                return jsonify({'message': 'Access denied: insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')  # 'student', 'faculty', 'tpc'
    
    if not username or not email or not password or not role:
        return jsonify({'message': 'Missing required fields'}), 400
        
    if role not in ['student', 'faculty', 'tpc']:
        return jsonify({'message': 'Invalid role specified'}), 400
        
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400
        
    try:
        new_user = User(username=username, email=email, role=role)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()  # To get new_user.id
        
        if role == 'student':
            roll_number = data.get('roll_number')
            full_name = data.get('full_name', username)
            if not roll_number:
                db.session.rollback()
                return jsonify({'message': 'Roll number is required for students'}), 400
            if StudentProfile.query.filter_by(roll_number=roll_number).first():
                db.session.rollback()
                return jsonify({'message': 'Roll number already registered'}), 400
                
            student_prof = StudentProfile(
                user_id=new_user.id,
                full_name=full_name,
                roll_number=roll_number,
                cgpa=float(data.get('cgpa', 0.0)),
                internships=int(data.get('internships', 0)),
                arrears=int(data.get('arrears', 0)),
                skills=data.get('skills', '')
            )
            db.session.add(student_prof)
            
        elif role == 'faculty':
            name = data.get('full_name', username)
            dept = data.get('department', 'General')
            faculty_prof = FacultyProfile(user_id=new_user.id, name=name, department=dept)
            db.session.add(faculty_prof)
            
        elif role == 'tpc':
            name = data.get('full_name', username)
            tpc_prof = TpcProfile(user_id=new_user.id, name=name)
            db.session.add(tpc_prof)
            
        db.session.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'message': 'Missing username or password'}), 400
        
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid username or password'}), 401
        
    token = generate_auth_token(user.id, user.role)
    
    profile_data = {}
    if user.role == 'student':
        profile_data = user.student_profile.to_dict() if user.student_profile else {}
    elif user.role == 'faculty':
        profile_data = user.faculty_profile.to_dict() if user.faculty_profile else {}
    elif user.role == 'tpc':
        profile_data = user.tpc_profile.to_dict() if user.tpc_profile else {}
        
    return jsonify({
        'token': token,
        'user': user.to_dict(),
        'profile': profile_data
    }), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_me():
    profile_data = {}
    if g.user.role == 'student':
        profile_data = g.user.student_profile.to_dict() if g.user.student_profile else {}
    elif g.user.role == 'faculty':
        profile_data = g.user.faculty_profile.to_dict() if g.user.faculty_profile else {}
    elif g.user.role == 'tpc':
        profile_data = g.user.tpc_profile.to_dict() if g.user.tpc_profile else {}
        
    return jsonify({
        'user': g.user.to_dict(),
        'profile': profile_data
    }), 200
