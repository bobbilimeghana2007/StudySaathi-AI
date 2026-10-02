import json
from datetime import datetime
from database.db import query_db, execute_db
from services.ai_service import AIService

class PlannerService:
    def __init__(self):
        self.ai = AIService()

    def get_active_plan(self, student_id=1):
        """Retrieves the current active study plan and its daily schedule."""
        plan = query_db("""
            SELECT * FROM study_plans 
            WHERE student_id = ? 
            ORDER BY id DESC LIMIT 1
        """, (student_id,), one=True)

        if not plan:
            return None

        days = query_db("""
            SELECT * FROM plan_days 
            WHERE plan_id = ? 
            ORDER BY day_number ASC
        """, (plan["id"],))

        return {
            "plan_info": plan,
            "days": days
        }

    def generate_and_save_plan(self, student_id, subject_name, topics, days_remaining, daily_hours):
        """Generates a plan via AI and commits it to the database for ALL requested days."""
        # Robust parsing: split by BOTH newlines and commas
        topics_list = []
        raw_items = [topics] if isinstance(topics, str) else (topics or [])

        for item in raw_items:
            for sub in str(item).replace('\n', ',').split(','):
                sub = sub.strip()
                if sub and sub not in topics_list:
                    topics_list.append(sub)

        if not topics_list:
            topics_list = [f"{subject_name} Core Concepts", f"{subject_name} Practice", f"{subject_name} Revision"]

        # Ensure days_remaining is positive
        target_days = max(1, int(days_remaining))

        # Get AI plan distribution for ALL requested days
        plan_days_data = self.ai.generate_study_plan(subject_name, topics_list, target_days, daily_hours)

        # Save main plan entry
        plan_id = execute_db("""
            INSERT INTO study_plans (student_id, subject_name, total_days, daily_hours)
            VALUES (?, ?, ?, ?)
        """, (student_id, subject_name, target_days, daily_hours))

        # Save days
        for day in plan_days_data:
            execute_db("""
                INSERT INTO plan_days (plan_id, day_number, topic_name, learn_minutes, practice_minutes, quiz_minutes, revision_minutes, is_completed)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0)
            """, (
                plan_id,
                day.get("day", 1),
                day.get("topic", "General Revision"),
                day.get("learn_min", 45),
                day.get("practice_min", 30),
                day.get("quiz_min", 15),
                day.get("revision_min", 30)
            ))

        # Register topics in topics table if not existing
        for topic in topics_list:
            existing = query_db("SELECT id FROM topics WHERE name = ?", (topic,), one=True)
            if not existing:
                execute_db("""
                    INSERT INTO topics (subject_id, name, mastery_score, status, is_weak)
                    VALUES (?, ?, ?, ?, ?)
                """, (1, topic, 0.0, 'pending', 0))

        return self.get_active_plan(student_id)

    def toggle_day_completion(self, day_id):
        """Toggles completion state of a specific day's plan."""
        day = query_db("SELECT is_completed FROM plan_days WHERE id = ?", (day_id,), one=True)
        if not day:
            return False
        
        new_state = 0 if day["is_completed"] == 1 else 1
        execute_db("UPDATE plan_days SET is_completed = ? WHERE id = ?", (new_state, day_id))
        return new_state == 1

    def get_todays_priority(self, student_id=1):
        """Dynamically calculates today's study priorities."""
        weak_topics = query_db("""
            SELECT name, mastery_score FROM topics 
            WHERE is_weak = 1 OR mastery_score < 60 
            ORDER BY mastery_score ASC LIMIT 2
        """)

        current_day = query_db("""
            SELECT pd.* FROM plan_days pd
            JOIN study_plans sp ON sp.id = pd.plan_id
            WHERE sp.student_id = ? AND pd.is_completed = 0
            ORDER BY pd.day_number ASC LIMIT 1
        """, (student_id,), one=True)

        priority_items = []
        
        for wt in weak_topics:
            priority_items.append({
                "type": "weak_topic_review",
                "title": f"⚠️ Priority Review: {wt['name']}",
                "detail": f"Current mastery is {wt['mastery_score']}%. Target 30 mins active recall practice.",
                "duration": "30 mins",
                "badge": "Urgent Review"
            })

        if current_day:
            priority_items.append({
                "type": "scheduled_topic",
                "title": f"🗓️ Day {current_day['day_number']} Goal: {current_day['topic_name']}",
                "detail": f"{current_day['learn_minutes']}m Learn + {current_day['practice_minutes']}m Practice",
                "duration": f"{current_day['learn_minutes'] + current_day['practice_minutes']} mins",
                "badge": "On Schedule"
            })

        if not priority_items:
            priority_items.append({
                "type": "comprehensive_quiz",
                "title": "🎯 Take a 15-Minute Mock Quiz",
                "detail": "Test all completed units to identify hidden knowledge gaps.",
                "duration": "15 mins",
                "badge": "Self Assessment"
            })

        return priority_items
