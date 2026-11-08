import os
import re

from dotenv import load_dotenv
from flask import (
    Flask,
    render_template,
    jsonify,
    request,
    make_response,
    redirect,
    url_for,
    flash,
    abort
)

from flask_login import (
    LoginManager,
    login_user,
    logout_user,
    login_required,
    current_user
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from models import db, Site, User, UserProgress


# ============================================================
# BASE DIRECTORY
# ============================================================

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(BASE_DIR, ".env"))


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "templates"),
    static_folder=os.path.join(BASE_DIR, "static")
)

flask_secret_key = os.getenv("FLASK_SECRET_KEY")
if not flask_secret_key:
    raise RuntimeError("FLASK_SECRET_KEY must be set in the environment.")
app.config["SECRET_KEY"] = flask_secret_key

DB_PATH = os.path.join(
    BASE_DIR,
    "final_database.db"
)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{DB_PATH}"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return make_response("", 204)


@app.after_request
def add_api_cors(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


# ============================================================
# DATABASE
# ============================================================

db.init_app(app)


# ============================================================
# LOGIN MANAGER
# ============================================================

login_manager = LoginManager()

login_manager.init_app(app)

login_manager.login_view = "home"


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(
        User,
        int(user_id)
    )


# ============================================================
# CONTEXT PROCESSOR (Global injection for current_user)
# ============================================================

@app.context_processor
def inject_user():
    return dict(current_user=current_user)


# ============================================================
# EMAIL VALIDATION
# ============================================================

EMAIL_REGEX = r"^[\w\.-]+@[\w\.-]+\.\w+$"


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

with app.app_context():
    db.create_all()


# ============================================================
# AYURVEDA RAG API
# ============================================================

from rag_api import rag_api

app.register_blueprint(rag_api)


# ============================================================
# PAGE NAVIGATION
# ============================================================

@app.route("/")
def home():
    return render_template(
        "homepage.html"
    )


# ------------------------------------------------------------
# MANDIRA
# ------------------------------------------------------------

@app.route("/mandira")
def mandira():
    sites = Site.query.order_by(
        Site.level.asc()
    ).all()

    max_level = 1

    if current_user.is_authenticated:
        progress = UserProgress.query.filter_by(
            user_id=current_user.id
        ).first()

        if progress:
            max_level = (
                progress.level_completed + 1
            )

    return render_template(
        "index.html",
        sites=sites,
        max_unlocked=max_level
    )


# ------------------------------------------------------------
# AHARA
# ------------------------------------------------------------

@app.route("/ahara")
def ahara():
    return render_template(
        "ahara.html"
    )


# ------------------------------------------------------------
# VEDAAI (Fixed Route Name to match templates)
# ------------------------------------------------------------

@app.route("/veda-ai")
def veda_ai():
    return render_template(
        "veda_ai.html"
    )


# ------------------------------------------------------------
# LEVEL
# ------------------------------------------------------------

@app.route("/level/<int:level_id>")
def play_level(level_id):
    site = Site.query.filter_by(
        level=level_id
    ).first()

    if not site:
        abort(404)

    return render_template(
        "level.html",
        site=site
    )


# ============================================================
# AUTHENTICATION
# ============================================================

@app.route(
    "/register",
    methods=["POST"]
)
def register():
    username = request.form.get(
        "username",
        ""
    ).strip()

    email = request.form.get(
        "email",
        ""
    ).strip().lower()

    password = request.form.get(
        "password",
        ""
    )

    if not username or not email or not password:
        flash(
            "All registration fields are required.",
            "error"
        )
        return redirect(
            url_for("home")
        )

    if not re.match(
        EMAIL_REGEX,
        email
    ):
        flash(
            "Please enter a valid email address.",
            "error"
        )
        return redirect(
            url_for("home")
        )

    if len(password) < 6:
        flash(
            "Password must be at least 6 characters long.",
            "error"
        )
        return redirect(
            url_for("home")
        )

    existing_user = User.query.filter(
        (User.username == username) |
        (User.email == email)
    ).first()

    if existing_user:
        flash(
            "Username or Email is already registered.",
            "error"
        )
        return redirect(
            url_for("home")
        )

    hashed_pw = generate_password_hash(
        password
    )

    new_user = User(
        username=username,
        email=email,
        password_hash=hashed_pw
    )

    db.session.add(new_user)
    db.session.commit()

    user_progress = UserProgress(
        user_id=new_user.id,
        level_completed=0,
        score=0,
        daily_streak=1
    )

    db.session.add(
        user_progress
    )
    db.session.commit()

    login_user(
        new_user,
        remember=True
    )

    return redirect(
        url_for("mandira")
    )


@app.route(
    "/login",
    methods=["POST"]
)
def login():
    login_identifier = request.form.get(
        "login_identifier",
        ""
    ).strip()

    password = request.form.get(
        "password",
        ""
    )

    user = User.query.filter(
        (User.username == login_identifier) |
        (User.email == login_identifier.lower())
    ).first()

    if user and check_password_hash(
        user.password_hash,
        password
    ):
        login_user(
            user,
            remember=True
        )
        return redirect(
            url_for("mandira")
        )

    flash(
        "Invalid username or password.",
        "error"
    )

    return redirect(
        url_for("home")
    )


@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(
        url_for("home")
    )


# ============================================================
# GAMEPLAY PROGRESS API
# ============================================================

@app.route(
    "/api/complete-level",
    methods=["POST"]
)
def complete_level():
    data = request.get_json() or {}

    completed_level = data.get(
        "level"
    )

    if not completed_level:
        return jsonify({
            "error": "Level identifier missing"
        }), 400

    if current_user.is_authenticated:
        progress = UserProgress.query.filter_by(
            user_id=current_user.id
        ).first()

        if not progress:
            progress = UserProgress(
                user_id=current_user.id,
                level_completed=completed_level
            )
            db.session.add(progress)

        elif completed_level > progress.level_completed:
            progress.level_completed = completed_level

        db.session.commit()

        next_level = (
            progress.level_completed + 1
        )

    else:
        next_level = (
            completed_level + 1
        )

    return jsonify({
        "success": True,
        "next_level": next_level
    })


# ============================================================
# SITE API
# ============================================================

@app.route(
    "/api/site/<int:level_id>"
)
def get_site_api(level_id):
    site = Site.query.filter_by(
        level=level_id
    ).first()

    if not site:
        return jsonify({
            "error": "Level not found"
        }), 404

    return jsonify({
        "level": site.level,
        "name": site.name,
        "location": site.location,
        "category": site.category,
        "era": site.era,
        "puzzle_type": site.puzzle_type,
        "image_url": site.image_url,
        "flashcard": {
            "built_by": site.built_by,
            "architecture_style": site.architecture_style,
            "primary_deity": site.primary_deity,
            "materials_used": site.materials_used,
            "history_overview": site.history_overview,
            "engineering_marvel": site.engineering_marvel,
            "sacred_legend": site.sacred_legend,
            "mystery_note": site.mystery_note
        }
    })


# ============================================================
# START FLASK
# ============================================================

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )