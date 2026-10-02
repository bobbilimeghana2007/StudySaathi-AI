-- StudySaathi AI Master Database Schema (Hackathon Production Edition)

CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT DEFAULT 'student123',
    name TEXT NOT NULL,
    category TEXT DEFAULT 'college', -- 'school' (Classes 6-10), 'intermediate' (Classes 11-12/JEE/NEET), 'college' (B.Tech/Degree)
    institution TEXT DEFAULT 'VNR VJIET / High School',
    grade_or_year TEXT DEFAULT '3rd Year / 5th Sem',
    roll_number TEXT DEFAULT '22CS101',
    preferred_language TEXT DEFAULT 'en', -- 'en', 'te' (Telugu), 'hi' (Hindi)
    exam_date TEXT,
    target_percentage INTEGER DEFAULT 88,
    daily_study_hours REAL DEFAULT 2.5,
    streak_count INTEGER DEFAULT 7,
    last_active_date TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER DEFAULT 1,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'college',
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id INTEGER,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'college',
    mastery_score REAL DEFAULT 0.0,
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    last_studied TEXT,
    is_weak INTEGER DEFAULT 0,
    diagram_code TEXT,
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
);

CREATE TABLE IF NOT EXISTS study_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER DEFAULT 1,
    subject_name TEXT NOT NULL,
    total_days INTEGER NOT NULL,
    daily_hours REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plan_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    day_number INTEGER NOT NULL,
    topic_name TEXT NOT NULL,
    learn_minutes INTEGER DEFAULT 45,
    practice_minutes INTEGER DEFAULT 30,
    quiz_minutes INTEGER DEFAULT 15,
    revision_minutes INTEGER DEFAULT 30,
    is_completed INTEGER DEFAULT 0,
    FOREIGN KEY(plan_id) REFERENCES study_plans(id)
);

CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name TEXT NOT NULL,
    subject_name TEXT DEFAULT 'General',
    category TEXT DEFAULT 'college',
    question_count INTEGER DEFAULT 5,
    score_percentage REAL DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER,
    question_type TEXT DEFAULT 'mcq',
    question TEXT NOT NULL,
    options_json TEXT,
    correct_answer TEXT,
    user_answer TEXT,
    is_correct INTEGER DEFAULT 0,
    explanation TEXT,
    diagram_mermaid TEXT,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_name TEXT NOT NULL,
    category TEXT DEFAULT 'all',
    front_question TEXT NOT NULL,
    back_answer TEXT NOT NULL,
    hint TEXT,
    mastered INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER DEFAULT 1,
    mode TEXT NOT NULL DEFAULT 'explain',
    language TEXT DEFAULT 'en',
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    diagram_code TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS uploaded_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    extracted_text TEXT,
    summary TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
