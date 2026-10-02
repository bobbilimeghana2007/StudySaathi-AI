import sqlite3
import json
import logging
from datetime import datetime, date
from pathlib import Path
from config import DB_PATH

logger = logging.getLogger(__name__)

def get_connection():
    """Returns a SQLite connection with dict-like row access."""
    conn = sqlite3.connect(str(DB_PATH), timeout=15)
    conn.row_factory = sqlite3.Row
    return conn

def migrate_schema():
    """Ensures all new columns exist in existing database tables."""
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            
            # Check students table columns
            cursor.execute("PRAGMA table_info(students)")
            existing_student_cols = [row["name"] for row in cursor.fetchall()]

            student_migrations = [
                ("category", "TEXT DEFAULT 'college'"),
                ("institution", "TEXT DEFAULT 'State University of Technology'"),
                ("grade_or_year", "TEXT DEFAULT '3rd Year / 5th Sem'"),
                ("roll_number", "TEXT DEFAULT '22CS084'"),
                ("preferred_language", "TEXT DEFAULT 'en'"),
                ("username", "TEXT"),
                ("password_hash", "TEXT DEFAULT 'student123'")
            ]

            for col_name, col_def in student_migrations:
                if col_name not in existing_student_cols:
                    try:
                        cursor.execute(f"ALTER TABLE students ADD COLUMN {col_name} {col_def}")
                    except Exception as e:
                        logger.debug(f"Student col migration note: {e}")

            # Check topics table columns
            cursor.execute("PRAGMA table_info(topics)")
            existing_topic_cols = [row["name"] for row in cursor.fetchall()]

            topic_migrations = [
                ("category", "TEXT DEFAULT 'college'"),
                ("diagram_code", "TEXT")
            ]

            for col_name, col_def in topic_migrations:
                if col_name not in existing_topic_cols:
                    try:
                        cursor.execute(f"ALTER TABLE topics ADD COLUMN {col_name} {col_def}")
                    except Exception as e:
                        logger.debug(f"Topic col migration note: {e}")

            conn.commit()
    except Exception as e:
        logger.error(f"Migration error: {e}")

def init_db():
    """Initializes schema, applies migrations, and seeds rich sample data."""
    schema_path = Path(__file__).resolve().parent / "schema.sql"
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    with get_connection() as conn:
        conn.executescript(schema_sql)

    # Apply column migrations to guarantee no 'no such column' errors
    migrate_schema()

    with get_connection() as conn:
        cursor = conn.cursor()

        # Check if student exists
        cursor.execute("SELECT COUNT(*) FROM students")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO students (
                    username, password_hash, name, category, institution, grade_or_year, 
                    roll_number, preferred_language, exam_date, target_percentage, 
                    daily_study_hours, streak_count, last_active_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                "meghana",
                "student123",
                "Meghana",
                "college",
                "State University of Technology",
                "3rd Year / 5th Sem",
                "22CS084",
                "en",
                (datetime.now().date()).strftime("%Y-%m-28"),
                88,
                2.5,
                7,
                datetime.now().strftime("%Y-%m-%d")
            ))
            student_id = cursor.lastrowid
        else:
            student_id = 1
            # Ensure student 1 has default values
            cursor.execute("""
                UPDATE students SET
                    category = COALESCE(category, 'college'),
                    institution = COALESCE(institution, 'State University of Technology'),
                    grade_or_year = COALESCE(grade_or_year, '3rd Year / 5th Sem'),
                    roll_number = COALESCE(roll_number, '22CS084'),
                    preferred_language = COALESCE(preferred_language, 'en')
                WHERE id = 1
            """)

        # Ensure Subjects Exist
        cursor.execute("SELECT COUNT(*) FROM subjects")
        if cursor.fetchone()[0] == 0:
            subjects_data = [
                (student_id, "Machine Learning", "college", "#6366f1"),
                (student_id, "Data Structures & Algorithms", "college", "#06b6d4"),
                (student_id, "Database Management Systems", "college", "#8b5cf6"),
                (student_id, "Physics: Laws of Motion", "school", "#f59e0b"),
                (student_id, "Biology: Photosynthesis & Life", "school", "#10b981"),
                (student_id, "Mathematics: Quadratic Equations", "school", "#ec4899"),
            ]
            cursor.executemany("""
                INSERT INTO subjects (student_id, name, category, color)
                VALUES (?, ?, ?, ?)
            """, subjects_data)

        # Ensure Topics Exist
        cursor.execute("SELECT COUNT(*) FROM topics")
        if cursor.fetchone()[0] == 0:
            cursor.execute("SELECT id, name FROM subjects")
            sub_map = {row["name"]: row["id"] for row in cursor.fetchall()}

            topics_data = [
                (sub_map.get("Machine Learning", 1), "Linear & Logistic Regression", "college", 90.0, "completed", 0, "graph LR; X[Input Data] --> W[Weights] --> S[Sigmoid/Activation] --> Y[Prediction];"),
                (sub_map.get("Machine Learning", 1), "Classification & Evaluation Metrics", "college", 85.0, "completed", 0, "graph TD; Pred[Prediction] --> TP[True Positive]; Pred --> FP[False Positive];"),
                (sub_map.get("Machine Learning", 1), "Decision Trees & Random Forests", "college", 45.0, "in_progress", 1, "graph TD; Root[Feature X > 5?] -->|Yes| Left[Class A]; Root -->|No| Right[Feature Y < 2?]; Right -->|Yes| C1[Class B]; Right -->|No| C2[Class C];"),
                (sub_map.get("Machine Learning", 1), "K-Means & Hierarchical Clustering", "college", 72.0, "in_progress", 0, "graph LR; Data[Data Points] --> Centroids[Init K Centroids] --> Assign[Assign Nearest] --> Update[Update Centers];"),
                (sub_map.get("Machine Learning", 1), "Neural Networks & Backpropagation", "college", 40.0, "pending", 1, "graph LR; In[Input Layer] --> Hid[Hidden Layer ReLU] --> Out[Output Layer Softmax] --> Loss[Loss Function] -.->|Gradient Flow| Hid;"),
                (sub_map.get("Physics: Laws of Motion", 4), "Newton's 1st Law (Inertia)", "school", 88.0, "completed", 0, "graph LR; Obj[Object in Motion] -->|Net Force = 0| Stay[Remains in Motion];"),
                (sub_map.get("Physics: Laws of Motion", 4), "Newton's 2nd Law (F = ma)", "school", 50.0, "in_progress", 1, "graph TD; Force[Force F] --> Mult[Mass m x Acceleration a];"),
                (sub_map.get("Biology: Photosynthesis & Life", 5), "Light Dependent Reactions (Chloroplast)", "school", 42.0, "in_progress", 1, "graph TD; Sun[Light Energy] + H2O[Water] --> Thylakoid[Thylakoid Membrane] --> ATP[ATP + NADPH] + O2[Oxygen Released];"),
                (sub_map.get("Mathematics: Quadratic Equations", 6), "Quadratic Formula & Discriminant", "school", 80.0, "completed", 0, "graph TD; Eq[ax^2 + bx + c = 0] --> Disc[D = b^2 - 4ac]; Disc -->|D > 0| Real[Two Real Roots]; Disc -->|D = 0| Equal[Equal Roots]; Disc -->|D < 0| Complex[No Real Roots];"),
            ]
            cursor.executemany("""
                INSERT INTO topics (subject_id, name, category, mastery_score, status, is_weak, diagram_code, last_studied)
                VALUES (?, ?, ?, ?, ?, ?, ?, date('now'))
            """, topics_data)

        # Ensure Flashcards Exist
        cursor.execute("SELECT COUNT(*) FROM flashcards")
        if cursor.fetchone()[0] == 0:
            flashcards_seed = [
                ("Neural Networks", "college", "What is the purpose of an Activation Function in Neural Networks?", "It introduces non-linearity, allowing the network to learn complex patterns beyond simple straight lines.", "Think about linear combinations vs curved decision boundaries."),
                ("Decision Trees", "college", "What is Information Gain?", "Information Gain measures the reduction in entropy (uncertainty) achieved by splitting data on an attribute.", "High gain = purer split."),
                ("Physics: Laws of Motion", "school", "State Newton's First Law of Motion.", "An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction, unless acted upon by an unbalanced external force.", "Also known as the Law of Inertia."),
                ("Biology: Photosynthesis", "school", "Where do the light-dependent reactions of photosynthesis take place?", "Inside the Thylakoid membranes of the Chloroplast.", "Contains chlorophyll green pigments."),
                ("Mathematics", "school", "What is the Quadratic Formula for ax² + bx + c = 0?", "x = (-b ± √(b² - 4ac)) / (2a)", "b² - 4ac is called the Discriminant (D)."),
            ]
            cursor.executemany("""
                INSERT INTO flashcards (topic_name, category, front_question, back_answer, hint)
                VALUES (?, ?, ?, ?, ?)
            """, flashcards_seed)

        conn.commit()

def query_db(query, args=(), one=False):
    """Runs SQL query and returns dictionary rows."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        rv = cur.fetchall()
        return (dict(rv[0]) if rv else None) if one else [dict(r) for r in rv]

def execute_db(query, args=()):
    """Executes insert, update, or delete query and commits."""
    with get_connection() as conn:
        cur = conn.cursor()
        cur.execute(query, args)
        conn.commit()
        return cur.lastrowid
