# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TODO management application with a unique dual-implementation architecture:

1. **Flask Backend Version**: Full-stack application with REST API and SQLite database (`app.py`, `static/`, `templates/`)
2. **Static GitHub Pages Version**: Client-side only implementation using localStorage (`docs/index.html`)

Both versions provide identical functionality and UI/UX but are deployed differently. Understanding this dual architecture is critical when making changes.

## Development Commands

### Running the Flask Version

```bash
# Install dependencies (if not already installed)
pip3 install -r requirements.txt
# or
python3 -m pip install -r requirements.txt --user

# Run the application (initializes database automatically)
python3 app.py

# Access at:
# http://localhost:5000
```

### Testing the API

```bash
# Create a new TODO
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test TODO", "description": "Testing the API"}'

# Get all TODOs
curl http://localhost:5000/api/todos

# Update TODO (mark as completed)
curl -X PUT http://localhost:5000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Delete TODO
curl -X DELETE http://localhost:5000/api/todos/1
```

### Testing the Static Version

Open `docs/index.html` directly in a browser. Data persists in browser localStorage.

## Architecture

### Dual-Version Strategy

**Why two versions?**
- **Flask version**: Demonstrates full-stack capability, suitable for local development, uses persistent database
- **Static version**: Zero-cost GitHub Pages deployment, no server required, uses browser localStorage

When modifying features, consider whether changes should be applied to both versions to maintain feature parity.

### Flask Version Structure

```
app.py              # Main Flask app with REST API endpoints
├── get_db()        # Database connection with context manager
├── init_db()       # Auto-creates todos table on first run
├── GET /           # Serves templates/index.html
└── /api/todos/*    # REST API endpoints

static/
├── app.js          # Frontend JavaScript (makes fetch() calls to API)
└── style.css       # Shared styling

templates/
└── index.html      # Flask template (loads static assets)
```

### Static Version Structure

```
docs/
└── index.html      # Single-file app with embedded CSS/JS
                    # Uses localStorage instead of API calls
```

## REST API Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| GET | `/api/todos` | Get all todos | - | Array of todo objects |
| POST | `/api/todos` | Create todo | `{title, description?}` | `{id, message}` |
| PUT | `/api/todos/:id` | Update todo | `{title?, description?, completed?}` | `{message}` |
| DELETE | `/api/todos/:id` | Delete todo | - | `{message}` |

## Database Schema

SQLite database (`todos.db`) with single table:

```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**Important patterns:**
- Database auto-initializes on app startup via `init_db()`
- All queries use context managers (`with get_db()`) for automatic connection cleanup
- Parameterized queries prevent SQL injection: `conn.execute('... WHERE id = ?', (todo_id,))`
- Boolean stored as 0/1 in SQLite

## Key Code Patterns

### Database Connection Pattern

```python
with get_db() as conn:
    cursor = conn.execute('SELECT * FROM todos')
    todos = [dict(row) for row in cursor.fetchall()]
# Connection automatically closed after with block
```

### API Response Pattern

All endpoints return JSON:
- Success: `return jsonify({...})` with appropriate status code
- Error: `return jsonify({'error': '...'}), 4xx`

### Frontend Data Flow

**Flask Version:**
1. User action → JavaScript event handler
2. `fetch('/api/todos', {...})` → Flask route
3. Flask → SQLite database operation
4. JSON response → Update DOM

**Static Version:**
1. User action → JavaScript event handler
2. localStorage read/write
3. Update DOM directly

## Deployment

### GitHub Pages (Static Version)

Deployed from `/docs` folder on `master` branch:
- URL: https://nene921.github.io/todo-app/
- Changes to `docs/index.html` automatically deploy
- Configured via: `gh api -X POST /repos/nene921/todo-app/pages -f source[branch]=master -f source[path]=/docs`

### Flask Version Deployment

Not currently deployed to a server. Can be deployed to:
- Render, Railway, Heroku (PaaS platforms)
- Any server with Python 3.8+ support

Runs in debug mode by default - change `app.run(debug=False)` for production.

## Security Considerations

- **XSS Prevention**: Frontend uses `escapeHtml()` function before inserting user content into DOM
- **SQL Injection Prevention**: All database queries use parameterized statements
- **Input Validation**: Title required on both client and server side
- **CORS**: Not configured (assumes same-origin for Flask version)

## Testing

No automated test suite currently exists. Manual testing checklist:
- Create TODO with title only
- Create TODO with title and description
- Toggle completion status
- Delete TODO (with confirmation)
- Filter by all/active/completed
- Test with empty title (should show validation error)
