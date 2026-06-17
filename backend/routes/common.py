from flask import Blueprint, jsonify
from models import Announcement, CompanyNews
from routes.auth import login_required

common_bp = Blueprint('common', __name__)

@common_bp.route('/announcements', methods=['GET'])
@login_required
def get_announcements():
    announcements = Announcement.query.order_by(Announcement.created_at.desc()).all()
    return jsonify([a.to_dict() for a in announcements]), 200

@common_bp.route('/company-news', methods=['GET'])
@login_required
def get_company_news():
    news = CompanyNews.query.order_by(CompanyNews.created_at.desc()).all()
    return jsonify([n.to_dict() for n in news]), 200
