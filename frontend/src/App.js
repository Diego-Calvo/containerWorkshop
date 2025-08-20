import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [lastUpdated, setLastUpdated] = useState(null);
  const [animatingTodos, setAnimatingTodos] = useState(new Set());
  
  // Get API URL from environment or use default for local development
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchTodos();
    fetchStats();
    fetchSystemHealth();
    
    // Set up auto-refresh every 10 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchSystemHealth();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/todos`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo, completed: false })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newTodoItem = await response.json();
      setNewTodo('');
      
      // Add animation effect
      setAnimatingTodos(prev => new Set([...prev, newTodoItem.id]));
      setTimeout(() => {
        setAnimatingTodos(prev => {
          const newSet = new Set(prev);
          newSet.delete(newTodoItem.id);
          return newSet;
        });
      }, 1000);
      
      await fetchTodos(); // Refresh the list
      await fetchStats(); // Update stats
    } catch (error) {
      console.error('Error adding todo:', error);
      setError('Failed to add todo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTodo = async (id) => {
    // Add animation effect
    setAnimatingTodos(prev => new Set([...prev, id]));
    
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/todos/${id}/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchTodos(); // Refresh the list
      await fetchStats(); // Update stats
    } catch (error) {
      console.error('Error toggling todo:', error);
      setError('Failed to update todo. Please try again.');
    } finally {
      setTimeout(() => {
        setAnimatingTodos(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }, 500);
    }
  };

  const deleteTodo = async (id, e) => {
    e.stopPropagation(); // Prevent toggle when clicking delete
    
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    
    setAnimatingTodos(prev => new Set([...prev, id]));
    
    try {
      const response = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
    }
  };

  const clearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);
    if (completedTodos.length === 0) return;
    
    if (!window.confirm(`Delete ${completedTodos.length} completed todo(s)?`)) return;
    
    try {
      await Promise.all(
        completedTodos.map(todo => 
          fetch(`${API_BASE}/api/todos/${todo.id}`, { method: 'DELETE' })
        )
      );
      
      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error('Error clearing completed todos:', error);
      setError('Failed to clear completed todos.');
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>🚀 Azure Container Apps Workshop</h1>
          <div className="system-status">
            <div className={`status-indicator ${systemHealth?.status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
              {systemHealth?.status === 'healthy' ? '🟢' : '🔴'} 
              {systemHealth?.status || 'Unknown'}
            </div>
            {systemHealth?.dapr?.enabled && (
              <div className="dapr-status">🔧 DAPR Enabled</div>
            )}
          </div>
        </div>
        
        <h2>📝 Interactive Todo Manager</h2>
        <p className="subtitle">Real-time data from DAPR-enabled backend</p>
        
        {/* Real-time Statistics Dashboard */}
        {stats && (
          <div className="stats-dashboard">
            <div className="stat-card">
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
              <div className="stat-label">Progress</div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        
        <div className="todo-controls">
          <div className="todo-input">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done? 🤔"
              onKeyPress={(e) => e.key === 'Enter' && !loading && addTodo()}
              disabled={loading}
              className="modern-input"
            />
            <button 
              onClick={addTodo} 
              disabled={loading || !newTodo.trim()}
              className="add-button modern-button"
            >
              {loading ? '⏳' : '➕'} Add
            </button>
          </div>
          
          <div className="filter-controls">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({todos.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({todos.filter(t => !t.completed).length})
            </button>
            <button 
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Completed ({todos.filter(t => t.completed).length})
            </button>
            {todos.some(t => t.completed) && (
              <button 
                className="clear-completed-btn"
                onClick={clearCompleted}
              >
                🗑️ Clear Completed
              </button>
            )}
          </div>
        </div>
        
        <div className="todo-list">
          {loading && todos.length === 0 ? (
            <div className="loading">
              <div className="spinner"></div>
              Loading todos...
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              {filter === 'all' ? (
                <div>
                  <h3>🎉 All caught up!</h3>
                  <p>No todos yet. Add one above to get started.</p>
                </div>
              ) : filter === 'pending' ? (
                <div>
                  <h3>✨ Nothing pending!</h3>
                  <p>Great job! All tasks are completed.</p>
                </div>
              ) : (
                <div>
                  <h3>🎯 No completed tasks</h3>
                  <p>Complete some tasks to see them here.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="todo-grid">
              {filteredTodos.map((todo, index) => (
                <div 
                  key={todo.id} 
                  className={`todo-item ${todo.completed ? 'completed' : ''} ${animatingTodos.has(todo.id) ? 'animating' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className="todo-content">
                    <div className="todo-status">
                      {todo.completed ? '✅' : '⭕'}
                    </div>
                    <div className="todo-text">{todo.text}</div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => deleteTodo(todo.id, e)}
                      title="Delete todo"
                    >
                      🗑️
                    </button>
                  </div>
                  {todo.createdAt && (
                    <div className="todo-meta">
                      <span className="todo-date">
                        📅 {new Date(todo.createdAt).toLocaleDateString()}
                      </span>
                      <span className="todo-time">
                        🕒 {new Date(todo.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="app-info">
          <div className="info-section">
            <h4>🏗️ Architecture</h4>
            <div className="architecture-grid">
              <div className="arch-item">
                <strong>Frontend:</strong> React + nginx
              </div>
              <div className="arch-item">
                <strong>Backend:</strong> Node.js + Express
              </div>
              <div className="arch-item">
                <strong>State:</strong> DAPR Enabled
              </div>
              <div className="arch-item">
                <strong>Platform:</strong> Azure Container Apps
              </div>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="last-updated">
              🔄 Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
          
          {systemHealth && (
            <div className="system-info">
              <div>Version: {systemHealth.version}</div>
              <div>Node: {systemHealth.environment?.nodeVersion}</div>
              <div>Uptime: {Math.round(systemHealth.environment?.uptime || 0)}s</div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
