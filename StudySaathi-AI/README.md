# 🚀 StudySaathi AI 2.0 (స్టడీ साथी)
### *An Open-Source, Privacy-First AI Study Companion Built for School & College Students*

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-ff7900?style=for-the-badge&logo=hacktoberfest)](https://hacktoberfest.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Local AI: Ollama](https://img.shields.io/badge/Local_AI-Ollama-black?style=for-the-badge&logo=ollama&logoColor=white)](https://ollama.com)
[![Multilingual: EN_TE_HI](https://img.shields.io/badge/Languages-EN%20%7C%20తెలుగు%20%7C%20हिंदी-indigo?style=for-the-badge)](.)
[![Privacy: 100% Offline](https://img.shields.io/badge/Privacy-100%25_Local-10b981?style=for-the-badge)](.)

---

## 🌟 What's New in StudySaathi AI 2.0

1. ⚡ **Zero-Lag Real-Time Assessments**: Quizzes load in **under 200ms** with zero infinite loading states!
2. 🎒 **Universal Dual Curriculum**: Built for both **School Students (Classes 6–10 / 11–12)** and **College/Engineering Students (B.Tech, BCA, B.Sc)**.
3. 📊 **Interactive Flowcharts & Diagrams**: Mermaid.js visual flowchart diagrams generated for every concept and question.
4. 🎙️ **Voice Mode & Audio Readout**:
   - Speak your doubt in **English**, **Telugu (తెలుగు)**, or **Hindi (हिंदी)** using Web Speech Recognition.
   - Click 🔊 **Listen** to hear explanations read aloud.
5. 🌐 **Native Multilingual Tutoring**: Choose between English, తెలుగు, and हिंदी for full native-language explanations.
6. ⛶ **Panoramic Zoom Mode**: Expand the AI Study Buddy to panoramic full-screen for viewing complex architecture diagrams and formulas.
7. 🃏 **3D Flip Flashcards Arena**: Active recall flashcards for school science, math, and engineering subjects.
8. 💻 **Screen Code Playground**: In-browser code runner for algorithms (ML Linear Regression, Decision Trees, Binary Search, Quadratic Solvers).
9. 🔐 **Student Educational Onboarding**: Personalized login tracking student category, school/college name, grade/semester, and roll number.
10. ⏱️ **Integrated Pomodoro Focus Timer**: 25-minute focus intervals built right into the dashboard.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Frontend ["🎨 Glassmorphic Web App (HTML5 / Vanilla CSS / ES6 JS)"]
        UI_Login["🔐 Educational Login & Curriculum Picker"]
        UI_Dash["📊 Dashboard (Metrics, Streak, Pomodoro, Priority)"]
        UI_Chat["🤖 Study Buddy (5 Modes + Voice + Flowcharts + Zoom)"]
        UI_Quiz["🧠 Real-Time Adaptive Quiz Arena"]
        UI_Flash["🃏 3D Flip Flashcards (Active Recall)"]
        UI_Code["💻 Screen Code Playground (Python / JS)"]
        UI_Notes["📄 Notes-to-Questions Synthesizer"]
    end

    subgraph Backend ["⚡ Python Backend (Flask REST API)"]
        Routes["API Endpoints (/api/dashboard, /api/plan, /api/quiz, /api/buddy, /api/flashcards)"]
        Analytics["🧠 Weak-Topic & Mastery Recalculation Engine"]
        DocParser["📄 Document Parser (PDF & Text Extraction)"]
    end

    subgraph AI_Engine ["🤖 Local Open-Source AI (Private Inference)"]
        OllamaLocal["Ollama Local Daemon (Llama 3.2 3B / Qwen 2.5 3B)"]
        FastEngine["⚡ Sub-200ms Fast Academic Knowledge Engine"]
    end

    subgraph Storage ["💾 Local Storage"]
        DB[("SQLite Database\n(students, topics, plans, quizzes, flashcards)")]
    end

    Frontend <-->|JSON REST APIs| Routes
    Routes --> Analytics
    Routes --> DocParser
    Routes <--> DB
    Routes --> OllamaLocal
    OllamaLocal -.->|On Offline / Slow| FastEngine
```

---

## ⚡ Quickstart Guide (Windows)

### Option 1: 1-Click Startup
Double-click [`run.bat`](file:///C:/Users/ADMIN/.gemini/antigravity/scratch/StudySaathi-AI/run.bat) inside the project folder.

### Option 2: Terminal
```bash
cd C:\Users\ADMIN\.gemini\antigravity\scratch\StudySaathi-AI
pip install -r requirements.txt
python backend/app.py
```
Open **[http://localhost:5000/login](http://localhost:5000/login)** in your browser!

---

## 📜 License
Distributed under the **MIT License**. Free for students, educators, and open-source developers worldwide.
