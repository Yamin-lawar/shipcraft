import uuid

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from pydantic import BaseModel

from .db import create_db, seed

sessions = {}


class Login(BaseModel):
    email: str
    password: str


class NewTask(BaseModel):
    title: str
    description: str = ""
    assignee_id: int | None = None
    due_date: str | None = None


class Invite(BaseModel):
    email: str


def create_app(db=None):
    db = db or create_db()
    seed(db)
    app = FastAPI()
    app.state.db = db

    def current_user(authorization: str = Header(default="")):
        user_id = sessions.get(authorization.replace("Bearer ", ""))
        if not user_id:
            raise HTTPException(401, "Login required")
        return user_id

    def require_member(project_id: int, user_id: int):
        row = db.execute("SELECT 1 FROM members WHERE project_id = ? AND user_id = ?", (project_id, user_id)).fetchone()
        if not row:
            raise HTTPException(404, "Project not found")

    @app.post("/login")
    def login(body: Login):
        row = db.execute("SELECT id FROM users WHERE email = ? AND password = ?", (body.email, body.password)).fetchone()
        if not row:
            raise HTTPException(401, "Wrong email or password")
        token = str(uuid.uuid4())
        sessions[token] = row["id"]
        return {"token": token, "userId": row["id"]}

    @app.get("/projects")
    def projects(user_id: int = Depends(current_user)):
        rows = db.execute("SELECT p.* FROM projects p JOIN members m ON m.project_id = p.id WHERE m.user_id = ?", (user_id,)).fetchall()
        return [dict(r) for r in rows]

    @app.get("/projects/{project_id}/tasks")
    def list_tasks(project_id: int, user_id: int = Depends(current_user)):
        require_member(project_id, user_id)
        return [dict(r) for r in db.execute("SELECT * FROM tasks WHERE project_id = ? ORDER BY id", (project_id,)).fetchall()]

    @app.post("/projects/{project_id}/tasks", status_code=201)
    def create_task(project_id: int, body: NewTask, user_id: int = Depends(current_user)):
        require_member(project_id, user_id)
        if not body.title.strip():
            raise HTTPException(400, "Title is required")
        cur = db.execute(
            "INSERT INTO tasks (project_id, title, description, assignee_id, due_date) VALUES (?, ?, ?, ?, ?)",
            (project_id, body.title.strip(), body.description, body.assignee_id, body.due_date),
        )
        db.commit()
        return dict(db.execute("SELECT * FROM tasks WHERE id = ?", (cur.lastrowid,)).fetchone())

    @app.get("/tasks/{task_id}")
    def get_task(task_id: int, user_id: int = Depends(current_user)):
        row = db.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Task not found")
        return dict(row)

    @app.post("/projects/{project_id}/invites", status_code=201)
    def invite(project_id: int, body: Invite, user_id: int = Depends(current_user)):
        require_member(project_id, user_id)
        if "@" not in body.email:
            raise HTTPException(400, "A valid email is required")
        cur = db.execute("INSERT INTO invites (project_id, email) VALUES (?, ?)", (project_id, body.email.lower()))
        db.commit()
        return {"id": cur.lastrowid, "email": body.email.lower()}

    @app.post("/projects/{project_id}/import")
    async def import_csv(project_id: int, request: Request, user_id: int = Depends(current_user)):
        require_member(project_id, user_id)
        text = (await request.body()).decode()
        rows = [line for line in text.splitlines() if line.strip()][1:]
        for row in rows:
            title, _, due = row.partition(",")
            db.execute("INSERT INTO tasks (project_id, title, due_date) VALUES (?, ?, ?)", (project_id, title, due or None))
        db.commit()
        return {"imported": len(rows)}

    @app.get("/health")
    def health():
        return {"ok": True}

    return app
