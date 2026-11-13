
from flask import Flask, request, jsonify, session
from database import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
import os

app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "change-this-secret-before-deployment"
)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response








# ================= HOME =================

import os
from flask import send_from_directory

@app.route("/")
def home():
    return send_from_directory(
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend"),
        "index.html"
    )

@app.route("/<path:filename>")
def frontend_files(filename):
    frontend_folder = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "frontend"
    )

    return send_from_directory(frontend_folder, filename)
# ================= STUDENTS =================

@app.route("/students")
def students():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM Student")
    data = cursor.fetchall()

    cursor.close()
    db.close()

    return str(data)


@app.route("/api/students", methods=["GET"])
def get_students():
    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("""SELECT student_id, name, email, qualification,
       cgpa, skills, preferred_type
FROM Student""")
    students = cursor.fetchall()

    cursor.close()
    db.close()

    return {"students": students}


@app.route("/api/students", methods=["POST"])

def add_student():

    data = request.get_json()

    if not data or not data.get("password"):
        return {
            "message": "Password is required"
        }, 400

    if data["cgpa"] < 0 or data["cgpa"] > 10:
        return {
            "message": "CGPA must be between 0 and 10"
        }, 400

    # Hash the password
    hashed_password = generate_password_hash(data["password"])

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
    INSERT INTO Student
    (name, email, qualification, cgpa, skills, preferred_type, password_hash)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    values = (
        data["name"],
        data["email"],
        data["qualification"],
        data["cgpa"],
        data["skills"],
        data["preferred_type"],
        hashed_password
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()

    return {
        "message": "Student added successfully!"
    }
@app.route("/api/students/<int:student_id>", methods=["GET"])
def get_student(student_id):

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
    SELECT student_id, name, email, qualification,
           cgpa, skills, preferred_type
    FROM Student
    WHERE student_id = %s
    """

    cursor.execute(sql, (student_id,))
    student = cursor.fetchone()

    cursor.close()
    db.close()

    if student is None:
        return {"message": "Student not found"}, 404

    return {"student": student}

@app.route("/api/students/<int:student_id>", methods=["PUT"])
def update_student(student_id):

    data = request.get_json()

    if not data:
        return {"message": "No data received"}, 400

    if data["cgpa"] < 0 or data["cgpa"] > 10:
        return {"message": "CGPA must be between 0 and 10"}, 400

    db = get_db_connection()
    cursor = db.cursor()

    # Check whether student exists
    cursor.execute(
        "SELECT student_id FROM Student WHERE student_id = %s",
        (student_id,)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Student not found"}, 404

    sql = """
    UPDATE Student
    SET name = %s,
        email = %s,
        qualification = %s,
        cgpa = %s,
        skills = %s,
        preferred_type = %s
    WHERE student_id = %s
    """

    values = (
        data["name"],
        data["email"],
        data["qualification"],
        data["cgpa"],
        data["skills"],
        data["preferred_type"],
        student_id
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()

    return {"message": "Profile updated successfully!"}

@app.route('/api/login', methods=['POST'])
def login_student():

    data = request.get_json()

    if not data or not data.get("email") or not data.get("password"):
        return jsonify({
            "message": "Email and password are required"
        }), 400

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
    SELECT student_id, name, email, password_hash
    FROM Student
    WHERE email = %s
    """

    cursor.execute(sql, (data["email"],))
    student = cursor.fetchone()

    cursor.close()
    db.close()

    if not student:
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(student[3], data["password"]):
        return jsonify({
            "message": "Invalid email or password"
        }), 401

    return jsonify({
        "message": "Login successful!",
        "student": {
            "student_id": student[0],
            "name": student[1],
            "email": student[2]
        }
    }), 200


# ================= OPPORTUNITIES =================

@app.route("/api/opportunities", methods=["GET"])
def get_opportunities():

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM Opportunity")
    opportunities = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "opportunities": opportunities
    }


@app.route("/api/opportunities", methods=["POST"])
def add_opportunity():

    data = request.get_json()

    if data["minimum_cgpa"] < 0 or data["minimum_cgpa"] > 10:
        return {"message": "Minimum CGPA must be between 0 and 10"}, 400

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
    INSERT INTO Opportunity
    (company_name, opportunity_title, opportunity_type,
     required_skills, minimum_cgpa, location)
    VALUES (%s, %s, %s, %s, %s, %s)
    """

    values = (
        data["company_name"],
        data["opportunity_title"],
        data["opportunity_type"],
        data["required_skills"],
        data["minimum_cgpa"],
        data["location"]
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()

    return {
        "message": "Opportunity added successfully!"
    }


# ================= APPLICATIONS =================

@app.route("/api/applications", methods=["GET"])

@app.route("/api/applications", methods=["GET"])
def get_applications():

    db = get_db_connection()
    cursor = db.cursor()

    sql = """
    SELECT
        Application.application_id,
        Application.student_id,
        Application.opportunity_id,
        Application.application_date,
        Application.status,
        Opportunity.company_name,
        Opportunity.opportunity_title,
        Opportunity.opportunity_type
    FROM Application
    JOIN Opportunity
    ON Application.opportunity_id = Opportunity.opportunity_id
    ORDER BY Application.application_id DESC
    """

    cursor.execute(sql)
    applications = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "applications": applications
    }
@app.route("/api/applications", methods=["POST"])
def add_application():

    data = request.get_json()

    db = get_db_connection()
    cursor = db.cursor()

    # Check whether student exists
    cursor.execute(
        "SELECT student_id FROM Student WHERE student_id = %s",
        (data["student_id"],)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Student not found"}, 404

    # Check whether opportunity exists
    cursor.execute(
        "SELECT opportunity_id FROM Opportunity WHERE opportunity_id = %s",
        (data["opportunity_id"],)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Opportunity not found"}, 404

    # Check the student's latest application
    cursor.execute(
        """
        SELECT status FROM Application
        WHERE student_id = %s AND opportunity_id = %s
        ORDER BY application_id DESC
        LIMIT 1
        """,
        (data["student_id"], data["opportunity_id"])
    )

    previous_application = cursor.fetchone()

    if previous_application is not None:
        previous_status = previous_application[0].strip().lower()

        if previous_status not in ("rejected", "withdrawn"):
            cursor.close()
            db.close()
            return {
                "message": "You cannot apply again unless your previous application was rejected or withdrawn."
            }, 409

    # Insert new application
    sql = """
    INSERT INTO Application
    (student_id, opportunity_id, application_date, status)
    VALUES (%s, %s, %s, %s)
    """

    values = (
        data["student_id"],
        data["opportunity_id"],
        data["application_date"],
        data["status"]
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()

    return {
        "message": "Application added successfully!"
    }


# ================= ALLOCATIONS =================

@app.route("/api/allocations", methods=["GET"])
def get_allocations():

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM Allocation")
    allocations = cursor.fetchall()

    cursor.close()
    db.close()

    return {
        "allocations": allocations
    }


@app.route("/api/allocations", methods=["POST"])

def add_allocation():

    data = request.get_json()

    db = get_db_connection()
    cursor = db.cursor()

    # Check whether student exists
    cursor.execute(
        "SELECT student_id FROM Student WHERE student_id = %s",
        (data["student_id"],)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Student not found"}, 404

    # Check whether opportunity exists
    cursor.execute(
        "SELECT opportunity_id FROM Opportunity WHERE opportunity_id = %s",
        (data["opportunity_id"],)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Opportunity not found"}, 404

    # Check whether student is already allocated
    cursor.execute(
        """
        SELECT allocation_id FROM Allocation
        WHERE student_id = %s AND opportunity_id = %s
        """,
        (data["student_id"], data["opportunity_id"])
    )

    if cursor.fetchone() is not None:
        cursor.close()
        db.close()
        return {
            "message": "Student is already allocated to this opportunity."
        }, 409

    # Insert allocation
    sql = """
    INSERT INTO Allocation
    (student_id, opportunity_id, allocation_date, status)
    VALUES (%s, %s, %s, %s)
    """

    values = (
        data["student_id"],
        data["opportunity_id"],
        data["allocation_date"],
        data["status"]
    )

    cursor.execute(sql, values)
    db.commit()

    cursor.close()
    db.close()

    return {
        "message": "Allocation added successfully!"
    }

# ================= MATCHING =================

@app.route("/api/match/<int:student_id>", methods=["GET"])
def match_opportunities(student_id):

    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # Get student
    cursor.execute(
        """
        SELECT *
        FROM Student
        WHERE student_id = %s
        """,
        (student_id,)
    )

    student = cursor.fetchone()

    if not student:
        cursor.close()
        db.close()

        return {
            "message": "Student not found"
        }, 404

    # Get opportunities
    # required_skills is renamed temporarily to skills
    cursor.execute(
        """
        SELECT
            opportunity_id,
            company_name,
            opportunity_title,
            opportunity_type,
            required_skills AS skills,
            minimum_cgpa,
            location
        FROM Opportunity
        """
    )

    opportunities = cursor.fetchall()

    matched = []

    # Check every opportunity
    for opportunity in opportunities:

        # CGPA matching
        cgpa_match = (
            float(student["cgpa"])
            >= float(opportunity["minimum_cgpa"])
        )

        # Skills matching
        skills_match = (
            opportunity["skills"].lower()
            in student["skills"].lower()
        )

        # Opportunity type matching
        type_match = (
            student["preferred_type"].lower()
            == opportunity["opportunity_type"].lower()
        )

        # If all conditions match
        if cgpa_match and skills_match and type_match:
            matched.append(opportunity)

    cursor.close()
    db.close()

    return {
        "student": student,
        "matched_opportunities": matched
    }
# Delete an opportunity
@app.route("/api/opportunities/<int:opportunity_id>", methods=["DELETE"])
def delete_opportunity(opportunity_id):

    db = get_db_connection()
    cursor = db.cursor()

    # Check whether students have applied
    cursor.execute(
        "SELECT application_id FROM Application WHERE opportunity_id = %s",
        (opportunity_id,)
    )

    applications = cursor.fetchall()

    # Check whether students have been allocated
    cursor.execute(
        "SELECT allocation_id FROM Allocation WHERE opportunity_id = %s",
        (opportunity_id,)
    )

    allocations = cursor.fetchall()

    if applications or allocations:
        cursor.close()
        db.close()

        return {
            "message": "Cannot delete this opportunity because applications or allocations already exist."
        }, 409

    # Delete opportunity if no related records exist
    cursor.execute(
        "DELETE FROM Opportunity WHERE opportunity_id = %s",
        (opportunity_id,)
    )

    if cursor.rowcount == 0:
        cursor.close()
        db.close()
        return {"message": "Opportunity not found"}, 404

    db.commit()

    cursor.close()
    db.close()

    return {"message": "Opportunity deleted successfully!"}


# Update application status
@app.route("/api/applications/<int:application_id>", methods=["PUT"])
def update_application_status(application_id):

    data = request.get_json()

    if not data or "status" not in data:
        return {"message": "Application status is required"}, 400

    status = data["status"]

    allowed_statuses = [
        "Applied",
        "Shortlisted",
        "Rejected",
        "Selected"
    ]

    if status not in allowed_statuses:
        return {"message": "Invalid application status"}, 400

    db = get_db_connection()
    cursor = db.cursor()

    cursor.execute(
        "SELECT application_id FROM Application WHERE application_id = %s",
        (application_id,)
    )

    if cursor.fetchone() is None:
        cursor.close()
        db.close()
        return {"message": "Application not found"}, 404

    cursor.execute(
        "UPDATE Application SET status = %s WHERE application_id = %s",
        (status, application_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return {"message": "Application status updated successfully!"}











# ================= ADMIN LOGIN =================

@app.route("/api/admin/login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return {"message": "Login details are required"}, 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return {"message": "Username and password are required"}, 400

    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            "SELECT admin_id, username, password_hash FROM Admin WHERE username = %s",
            (username,)
        )

        admin = cursor.fetchone()

        if admin and check_password_hash(admin[2], password):
            session["admin_id"] = admin[0]
            session["admin_username"] = admin[1]

            return {
                "message": "Admin login successful!",
                "admin_id": admin[0],
                "username": admin[1]
            }

        return {"message": "Invalid username or password"}, 401

    finally:
        cursor.close()
        db.close()

# ================= RUN APPLICATION =================

if __name__ == "__main__":
    app.run(debug=True)

    