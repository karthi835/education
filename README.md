# 🎓 Education Management System - Setup & Installation Guide

This guide describes how to configure, set up, and run the Education Management System.

---

## 🛠️ System Prerequisites

Ensure you have the following software installed on your system:
- **Node.js** (v18.x or newer)
- **Python** (v3.10 or newer)
- **PostgreSQL Database**

---

## 📂 Project Structure

```text
education/
│
├── education_service/           # FastAPI backend
│   ├── app/
│   │   ├── dependencies/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env
│
└── education-frontend/          # React Vite frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## 1. 🗄️ Database Setup

1. Open your PostgreSQL administration client (e.g., pgAdmin, psql CLI).
2. Create a new database named `education_db`:
   ```sql
   CREATE DATABASE education_db;
   ```
3. Ensure PostgreSQL is running and you have the correct connection parameters.

---

## 2. 🐍 Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend service:
   ```bash
   cd c:\Users\kn099\Downloads\education\education_service
   ```
2. Create a virtual python environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows Powershell**: .\venv\Scripts\Activate.ps1
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows Command Prompt (CMD)**:
     ```cmd
     .\venv\Scripts\activate.bat
     ```
4. Install all python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Update your database configuration credentials in `.env` if necessary:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/education_db
   ```
6. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *Note: Database tables will be automatically created on startup using the SQLAlchemy base context!*
   - Interactive OpenAPI documentation will be accessible at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 3. 💻 Frontend Setup (React Vite)

1. Open another terminal window and navigate to the frontend directory:
   ```bash
   cd c:\Users\kn099\Downloads\education\education-frontend
   ```
2. Install all node packages:
   ```bash
   npm install
   ```
3. Run the frontend development server:
   ```bash
   npm run dev
   ```
4. Open your web browser and view the user interface at: [http://localhost:5173](http://localhost:5173)

---

## 🚀 Key Features Walkthrough

1. **Admin Registration**: Access [http://localhost:5173](http://localhost:5173), switch to "Register" mode, and register a new administrator user.
2. **Dashboard**: Once logged in, view the total counts, statistical graphs, and upload activity log.
3. **Data Import**: Navigate to the "Upload Data" menu. Drag and drop any `.xlsx` or `.csv` student file containing headers like name, email, course, phone, department, year, and city.
4. **Student Directory**: Search for students, filter records by courses, sort columns dynamically, perform CRUD edits/deletions, or export the table back to Excel/CSV.

---

## ☁️ Git Push Commands

To push this project to a remote Git repository (such as GitHub, GitLab, or Bitbucket), run the following commands from the project root (`education` directory):

1. **Initialize the repository** (if you haven't already):
   ```bash
   git init
   ```

2. **Add all files to staging**:
   ```bash
   git add .
   ```
   *(Note: If you encounter an `index.lock` error from an outer directory like `C:/Users/kn099/`, running `git init` here first will fix it by creating an isolated local repository.)*

3. **Commit your changes**:
   ```bash
   git commit -m "Initial commit"
   ```

4. **Link to your remote repository** (replace `YOUR_REPO_URL` with your actual URL):
   ```bash
   git remote add origin YOUR_REPO_URL
   ```

5. **Push the code to the main branch**:
   ```bash
   git branch -M main
   git push -u origin main
   ```
