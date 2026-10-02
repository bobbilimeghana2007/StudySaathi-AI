from database.db import query_db, execute_db

class AnalyticsService:
    def get_dashboard_summary(self, student_id=1, category=None):
        """Compiles student profile, category (school/college), streak, mastery, and weak topics."""
        student = query_db("SELECT * FROM students WHERE id = ?", (student_id,), one=True)
        if not student:
            student = {
                "name": "Meghana",
                "category": "college",
                "institution": "State University of Technology",
                "grade_or_year": "3rd Year / 5th Sem",
                "roll_number": "22CS084",
                "preferred_language": "en",
                "streak_count": 7,
                "target_percentage": 88,
                "exam_date": "2026-10-28"
            }

        # Topics query (optionally filter by category)
        if category and category != "all":
            topics = query_db("SELECT * FROM topics WHERE category = ? ORDER BY mastery_score ASC", (category,))
        else:
            topics = query_db("SELECT * FROM topics ORDER BY mastery_score ASC")

        total_topics = len(topics)
        completed_topics = sum(1 for t in topics if t["mastery_score"] >= 75 or t["status"] == "completed")
        weak_topics = [t for t in topics if t["mastery_score"] < 60]
        strong_topics = [t for t in topics if t["mastery_score"] >= 75]

        avg_mastery = round(sum(t["mastery_score"] for t in topics) / max(1, total_topics), 1)

        # Quizzes taken
        quiz_stats = query_db("SELECT COUNT(*) as total_quizzes, AVG(score_percentage) as avg_score FROM quizzes", one=True)
        total_quizzes = quiz_stats["total_quizzes"] if quiz_stats else 0
        avg_quiz_score = round(quiz_stats["avg_score"], 1) if quiz_stats and quiz_stats["avg_score"] else 0.0

        # Plan progress
        plan_progress = query_db("""
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_days
            FROM plan_days
        """, one=True)
        
        total_days = plan_progress["total_days"] if plan_progress and plan_progress["total_days"] else 1
        completed_days = plan_progress["completed_days"] if plan_progress and plan_progress["completed_days"] else 0
        plan_completion_pct = round((completed_days / max(1, total_days)) * 100, 1)

        return {
            "student": student,
            "streak": student.get("streak_count", 7),
            "category": student.get("category", "college"),
            "total_topics": total_topics,
            "completed_topics": completed_topics,
            "avg_mastery": avg_mastery,
            "total_quizzes": total_quizzes,
            "avg_quiz_score": avg_quiz_score,
            "plan_completion_pct": plan_completion_pct,
            "completed_days": completed_days,
            "total_days": total_days,
            "weak_topics": weak_topics,
            "strong_topics": strong_topics,
            "all_topics": topics
        }

    def get_flashcards(self, category=None):
        """Fetches active recall flashcards."""
        if category and category != "all":
            return query_db("SELECT * FROM flashcards WHERE category = ? OR category = 'all'", (category,))
        return query_db("SELECT * FROM flashcards")

    def record_quiz_result(self, topic_name, score_pct):
        """Records a quiz attempt and updates topic mastery in database."""
        execute_db("""
            INSERT INTO quizzes (topic_name, question_count, score_percentage)
            VALUES (?, 3, ?)
        """, (topic_name, score_pct))

        # Update topic mastery
        topic = query_db("SELECT * FROM topics WHERE name LIKE ?", (f"%{topic_name}%",), one=True)
        is_weak = 1 if score_pct < 60 else 0

        if topic:
            new_score = round((topic["mastery_score"] * 0.5) + (score_pct * 0.5), 1)
            new_status = "completed" if new_score >= 80 else "in_progress"
            new_is_weak = 1 if new_score < 60 else 0

            execute_db("""
                UPDATE topics 
                SET mastery_score = ?, status = ?, is_weak = ?, last_studied = date('now')
                WHERE id = ?
            """, (new_score, new_status, new_is_weak, topic["id"]))
        else:
            execute_db("""
                INSERT INTO topics (subject_id, name, mastery_score, status, is_weak, last_studied)
                VALUES (1, ?, ?, ?, ?, date('now'))
            """, (topic_name, score_pct, 'in_progress', is_weak))

        return True
