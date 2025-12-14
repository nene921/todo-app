from flask import Flask, render_template, request, jsonify
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)
DATABASE = 'todos.db'

def get_db():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize database"""
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

@app.route('/')
def index():
    """Render main page"""
    return render_template('index.html')

@app.route('/api/todos', methods=['GET'])
def get_todos():
    """Get all todos"""
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM todos ORDER BY created_at DESC')
        todos = [dict(row) for row in cursor.fetchall()]
    return jsonify(todos)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    """Create a new todo"""
    data = request.get_json()
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()

    if not title:
        return jsonify({'error': 'Title is required'}), 400

    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO todos (title, description) VALUES (?, ?)',
            (title, description)
        )
        conn.commit()
        todo_id = cursor.lastrowid

    return jsonify({'id': todo_id, 'message': 'Todo created successfully'}), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    """Update a todo"""
    data = request.get_json()

    with get_db() as conn:
        # Check if todo exists
        todo = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,)).fetchone()
        if not todo:
            return jsonify({'error': 'Todo not found'}), 404

        # Update fields
        if 'title' in data:
            conn.execute('UPDATE todos SET title = ? WHERE id = ?',
                        (data['title'], todo_id))
        if 'description' in data:
            conn.execute('UPDATE todos SET description = ? WHERE id = ?',
                        (data['description'], todo_id))
        if 'completed' in data:
            conn.execute('UPDATE todos SET completed = ? WHERE id = ?',
                        (1 if data['completed'] else 0, todo_id))

        conn.commit()

    return jsonify({'message': 'Todo updated successfully'})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    """Delete a todo"""
    with get_db() as conn:
        cursor = conn.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({'error': 'Todo not found'}), 404

    return jsonify({'message': 'Todo deleted successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)
