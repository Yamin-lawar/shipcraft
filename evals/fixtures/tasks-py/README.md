# tasks-py (fixture)

The same small task tracker as `tasks-node`, in Python with FastAPI and SQLite (standard library). It is a sample codebase for Shipcraft's evals. Not shipped.

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest
uvicorn app.main:app
```

Seed data: `alice@example.com` and `bob@example.com`, password `password1` (fake). Alice owns project 1, Bob owns project 2.
