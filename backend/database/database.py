import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash

# ==========================
# Paths
# ==========================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATABASE_FOLDER = os.path.join(BASE_DIR, "database")
DB_PATH = os.path.abspath(os.environ.get(
    "ROAD_HEALTH_DB",
    os.path.join(DATABASE_FOLDER, "road_health.db"),
))
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)


# ==========================
# Database Connection
# ==========================

def get_connection():

    conn = sqlite3.connect(DB_PATH)

    conn.row_factory = sqlite3.Row

    return conn


# ==========================
# Create Database
# ==========================

def init_db():

    conn = get_connection()

    cursor = conn.cursor()


    # ==========================
    # ROAD REPORTS TABLE
    # ==========================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS road_reports (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            road_name TEXT NOT NULL,

            area TEXT,

            latitude TEXT,

            longitude TEXT,

            potholes INTEGER DEFAULT 0,

            score INTEGER DEFAULT 100,

            condition TEXT,

            severity TEXT,

            confidence REAL,

            recommendation TEXT,

            analysis_time TEXT,

            image TEXT,
            owner_username TEXT,
            source_image TEXT

        )
    """)

    # Upgrade databases shipped with earlier project versions.
    report_columns = {row["name"] for row in cursor.execute("PRAGMA table_info(road_reports)").fetchall()}
    if "owner_username" not in report_columns:
        cursor.execute("ALTER TABLE road_reports ADD COLUMN owner_username TEXT")
    if "source_image" not in report_columns:
        cursor.execute("ALTER TABLE road_reports ADD COLUMN source_image TEXT")

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            role TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            role TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            created_at TEXT NOT NULL
        )
    """)

    # Demo accounts are created once and their passwords are stored as hashes.
    demo_users = [
        ("admin", "System Admin", "Admin", "Admin@123"),
        ("supervisor", "Maintenance Supervisor", "Maintenance Supervisor", "Supervisor@123"),
        ("reporter", "Road Reporter", "Reporter", "Reporter@123"),
    ]
    for username, display_name, role, password in demo_users:
        cursor.execute(
            "INSERT OR IGNORE INTO app_users (username, display_name, role, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
            (username, display_name, role, generate_password_hash(password), datetime.now().isoformat(timespec="seconds")),
        )


    # ==========================
    # WORKERS TABLE
    # ==========================

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workers (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            name TEXT NOT NULL,

            phone TEXT,

            area TEXT,

            road TEXT,

            task TEXT,

            status TEXT DEFAULT 'Available',

            created_at TEXT

        )
    """)


    conn.commit()

    conn.close()

    print("✅ Database Initialized Successfully")


# ==========================
# INSERT REPORT
# ==========================

def save_report(
    road_name,
    area,
    latitude,
    longitude,
    potholes,
    score,
    condition,
    severity,
    confidence,
    recommendation,
    image,
    owner_username=None,
    source_image=None,
):

    conn = get_connection()

    cursor = conn.cursor()


    analysis_time = datetime.now().strftime(
        "%d-%m-%Y %H:%M:%S"
    )


    cursor.execute("""
        INSERT INTO road_reports (

            road_name,
            area,
            latitude,
            longitude,
            potholes,
            score,
            condition,
            severity,
            confidence,
            recommendation,
            analysis_time,
            image,
            owner_username,
            source_image

        )

        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    """, (

        road_name,
        area,
        latitude,
        longitude,
        potholes,
        score,
        condition,
        severity,
        confidence,
        recommendation,
        analysis_time,
        image,
        owner_username,
        source_image

    ))


    conn.commit()

    conn.close()


# ==========================
# GET ALL REPORTS
# ==========================

def get_all_reports(owner_username=None):

    conn = get_connection()

    cursor = conn.cursor()


    if owner_username:
        cursor.execute("""
            SELECT * FROM road_reports
            WHERE owner_username = ?
            ORDER BY id DESC
        """, (owner_username,))
    else:
        cursor.execute("""
            SELECT * FROM road_reports
            ORDER BY id DESC
        """)


    reports = cursor.fetchall()

    conn.close()


    return reports


def get_user_by_username(username):
    conn = get_connection()
    user = conn.execute("SELECT * FROM app_users WHERE username = ?", (username,)).fetchone()
    conn.close()
    return user


def record_activity(username, role, action, details="", ip_address=""):
    conn = get_connection()
    conn.execute(
        "INSERT INTO activity_logs (username, role, action, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (username, role, action, details, ip_address, datetime.now().isoformat(timespec="seconds")),
    )
    conn.commit()
    conn.close()


def get_activity(limit=250):
    conn = get_connection()
    rows = conn.execute(
        "SELECT id, username, role, action, details, created_at FROM activity_logs ORDER BY id DESC LIMIT ?",
        (max(1, min(int(limit), 500)),),
    ).fetchall()
    conn.close()
    return [dict(row) for row in rows]


def report_belongs_to_image(filename, username):
    conn = get_connection()
    row = conn.execute(
        "SELECT 1 FROM road_reports WHERE owner_username = ? AND (image = ? OR source_image = ?) LIMIT 1",
        (username, filename, filename),
    ).fetchone()
    conn.close()
    return row is not None


# ==========================
# GET SINGLE REPORT
# ==========================

def get_report(report_id):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        "SELECT * FROM road_reports WHERE id=?",
        (report_id,)
    )


    report = cursor.fetchone()

    conn.close()


    return report


# ==========================
# UPDATE REPORT LOCATION
# ==========================

def update_report_location(report_id, latitude, longitude):

    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "UPDATE road_reports SET latitude=?, longitude=? WHERE id=?",
        (latitude, longitude, report_id)
    )

    updated = cursor.rowcount > 0
    conn.commit()
    conn.close()

    return updated


# ==========================
# DELETE REPORT
# ==========================

def delete_report(report_id):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        "DELETE FROM road_reports WHERE id=?",
        (report_id,)
    )


    conn.commit()

    conn.close()


# =====================================================
# WORKER FUNCTIONS
# =====================================================


# ==========================
# ADD WORKER
# ==========================

def add_worker(
    name,
    phone,
    area,
    road="",
    task="",
    status="Available"
):

    conn = get_connection()

    cursor = conn.cursor()


    created_at = datetime.now().strftime(
        "%d-%m-%Y %H:%M:%S"
    )


    cursor.execute("""
        INSERT INTO workers (

            name,
            phone,
            area,
            road,
            task,
            status,
            created_at

        )

        VALUES (?, ?, ?, ?, ?, ?, ?)

    """, (

        name,
        phone,
        area,
        road,
        task,
        status,
        created_at

    ))


    worker_id = cursor.lastrowid


    conn.commit()

    conn.close()


    return worker_id


# ==========================
# GET ALL WORKERS
# ==========================

def get_all_workers():

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute("""
        SELECT *
        FROM workers
        ORDER BY id DESC
    """)


    workers = cursor.fetchall()

    conn.close()


    return workers


# ==========================
# GET SINGLE WORKER
# ==========================

def get_worker(worker_id):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        "SELECT * FROM workers WHERE id=?",
        (worker_id,)
    )


    worker = cursor.fetchone()

    conn.close()


    return worker


# ==========================
# UPDATE WORKER
# ==========================

def update_worker(
    worker_id,
    name,
    phone,
    area,
    road,
    task,
    status
):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute("""
        UPDATE workers

        SET
            name=?,
            phone=?,
            area=?,
            road=?,
            task=?,
            status=?

        WHERE id=?

    """, (

        name,
        phone,
        area,
        road,
        task,
        status,
        worker_id

    ))


    conn.commit()

    conn.close()


# ==========================
# UPDATE WORKER STATUS
# ==========================

def update_worker_status(
    worker_id,
    status
):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute("""
        UPDATE workers

        SET status=?

        WHERE id=?

    """, (

        status,
        worker_id

    ))


    conn.commit()

    conn.close()


# ==========================
# DELETE WORKER
# ==========================

def delete_worker(worker_id):

    conn = get_connection()

    cursor = conn.cursor()


    cursor.execute(
        "DELETE FROM workers WHERE id=?",
        (worker_id,)
    )


    conn.commit()

    conn.close()


# ==========================
# RUN DIRECTLY
# ==========================

if __name__ == "__main__":

    init_db()

    print("✅ Road Health Database Ready")
    
