let currentFilter = 'all';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('todo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createTodo();
    });

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            loadTodos();
        });
    });
}

async function loadTodos() {
    const todosList = document.getElementById('todos-list');
    todosList.innerHTML = '<p class="loading">読み込み中...</p>';

    try {
        const response = await fetch('/api/todos');
        const todos = await response.json();

        if (todos.length === 0) {
            todosList.innerHTML = '<p class="empty-state">TODOがまだありません。新しいTODOを追加してください。</p>';
            return;
        }

        // Filter todos
        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        if (filteredTodos.length === 0) {
            todosList.innerHTML = '<p class="empty-state">該当するTODOがありません。</p>';
            return;
        }

        // Render todos
        todosList.innerHTML = filteredTodos.map(todo => createTodoElement(todo)).join('');

        // Add event listeners to checkboxes and delete buttons
        filteredTodos.forEach(todo => {
            const checkbox = document.getElementById(`todo-${todo.id}`);
            checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

            const deleteBtn = document.querySelector(`[data-todo-id="${todo.id}"]`);
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));
        });

    } catch (error) {
        console.error('Error loading todos:', error);
        todosList.innerHTML = '<p class="empty-state">エラーが発生しました。</p>';
    }
}

function createTodoElement(todo) {
    const date = new Date(todo.created_at);
    const formattedDate = date.toLocaleString('ja-JP');

    return `
        <div class="todo-item ${todo.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                class="todo-checkbox"
                id="todo-${todo.id}"
                ${todo.completed ? 'checked' : ''}
            >
            <div class="todo-content">
                <h3>${escapeHtml(todo.title)}</h3>
                ${todo.description ? `<p>${escapeHtml(todo.description)}</p>` : ''}
                <span class="todo-date">${formattedDate}</span>
            </div>
            <div class="todo-actions">
                <button class="btn-delete" data-todo-id="${todo.id}">削除</button>
            </div>
        </div>
    `;
}

async function createTodo() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!title) {
        alert('タイトルを入力してください');
        return;
    }

    try {
        const response = await fetch('/api/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description })
        });

        if (response.ok) {
            document.getElementById('todo-form').reset();
            await loadTodos();
        } else {
            const error = await response.json();
            alert(`エラー: ${error.error}`);
        }
    } catch (error) {
        console.error('Error creating todo:', error);
        alert('TODOの作成に失敗しました');
    }
}

async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ completed })
        });

        if (response.ok) {
            await loadTodos();
        } else {
            alert('TODOの更新に失敗しました');
            await loadTodos();
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        alert('TODOの更新に失敗しました');
        await loadTodos();
    }
}

async function deleteTodo(id) {
    if (!confirm('このTODOを削除しますか？')) {
        return;
    }

    try {
        const response = await fetch(`/api/todos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            await loadTodos();
        } else {
            alert('TODOの削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('TODOの削除に失敗しました');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
