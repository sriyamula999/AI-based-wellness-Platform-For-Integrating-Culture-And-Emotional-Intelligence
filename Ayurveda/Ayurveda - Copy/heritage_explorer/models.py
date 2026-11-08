from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # One-to-one relationship with UserProgress
    progress = db.relationship('UserProgress', backref='user', uselist=False, cascade="all, delete-orphan")


class UserProgress(db.Model):
    __tablename__ = 'user_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    level_completed = db.Column(db.Integer, default=0)
    score = db.Column(db.Integer, default=0)
    daily_streak = db.Column(db.Integer, default=1)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)


class Site(db.Model):
    __tablename__ = 'sites'
    
    id = db.Column(db.Integer, primary_key=True)
    level = db.Column(db.Integer, unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    era = db.Column(db.String(50), nullable=False)
    puzzle_type = db.Column(db.String(50), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    
    # Detailed Metadata
    built_by = db.Column(db.String(120))
    architecture_style = db.Column(db.String(120))
    primary_deity = db.Column(db.String(100))
    materials_used = db.Column(db.String(150))
    
    # Extended Lore Columns
    history_overview = db.Column(db.Text)
    engineering_marvel = db.Column(db.Text)
    sacred_legend = db.Column(db.Text)
    mystery_note = db.Column(db.Text)