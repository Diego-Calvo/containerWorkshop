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
  
  // Network activity state
  const [networkActivity, setNetworkActivity] = useState([]);
  const [activeRequests, setActiveRequests] = useState(0);
  const [lastApiCall, setLastApiCall] = useState(null);
  
  // Get API URL from environment or detect based on hostname for Container Apps
  const getApiUrl = () => {
    // If environment variable is set, use it
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // For local development
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001';
    }
    
    // For Container Apps deployment, replace 'frontend' with 'backend' in the hostname
    if (window.location.hostname.includes('azurecontainerapps.io')) {
      const backendHostname = window.location.hostname.replace('workshop-frontend-dev', 'workshop-backend-dev');
      return `https://${backendHostname}`;
    }
    
    // Fallback
    return 'http://localhost:3001';
  };
  
  const API_BASE = getApiUrl();
  
  // Log the API URL being used for debugging
  useEffect(() => {
    console.log('🔗 API Base URL:', API_BASE);
    console.log('🌐 Current hostname:', window.location.hostname);
  }, [API_BASE]);

  // Helper function to log API calls
  const logApiCall = (endpoint, method = 'GET', status = 'loading') => {
    const timestamp = new Date();
    const apiCall = {
      id: Date.now(),
      endpoint,
      method,
      status,
      timestamp,
      containerSource: 'Backend Container (Node.js)',
      url: `${API_BASE}${endpoint}`,
      type: getApiCallType(endpoint)
    };
    
    setLastApiCall(apiCall);
    setNetworkActivity(prev => [apiCall, ...prev.slice(0, 9)]); // Keep last 10 calls
    
    if (status === 'loading') {
      setActiveRequests(prev => prev + 1);
    } else {
      setActiveRequests(prev => Math.max(0, prev - 1));
    }
  };

  // Helper function to categorize API calls for better visualization
  const getApiCallType = (endpoint) => {
    if (endpoint.includes('/health')) return 'health';
    if (endpoint.includes('/stats')) return 'stats';
    if (endpoint.includes('/todos')) return 'todos';
    return 'other';
  };

  // Helper function to update API call status
  const updateApiCallStatus = (endpoint, status, responseTime) => {
    setNetworkActivity(prev => 
      prev.map(call => 
        call.endpoint === endpoint && call.status === 'loading'
          ? { ...call, status, responseTime, completedAt: new Date() }
          : call
      )
    );
    setActiveRequests(prev => Math.max(0, prev - 1));
  };

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
    const startTime = Date.now();
    logApiCall('/api/todos', 'GET', 'loading');
    
    try {
      const response = await fetch(`${API_BASE}/api/todos`);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTodos(data);
      setLastUpdated(new Date());
      updateApiCallStatus('/api/todos', 'success', responseTime);
    } catch (error) {
      console.error('Error fetching todos:', error);
      setError('Failed to load todos. Please check if the backend is running.');
      updateApiCallStatus('/api/todos', 'error', Date.now() - startTime);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const startTime = Date.now();
    logApiCall('/api/stats', 'GET', 'loading');
    
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        updateApiCallStatus('/api/stats', 'success', responseTime);
      } else {
        updateApiCallStatus('/api/stats', 'error', responseTime);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      updateApiCallStatus('/api/stats', 'error', Date.now() - startTime);
    }
  };

  const fetchSystemHealth = async () => {
    const startTime = Date.now();
    logApiCall('/health', 'GET', 'loading');
    
    try {
      const response = await fetch(`${API_BASE}/health`);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
        updateApiCallStatus('/health', 'success', responseTime);
      } else {
        updateApiCallStatus('/health', 'error', responseTime);
      }
    } catch (error) {
      console.error('Error fetching health:', error);
      updateApiCallStatus('/health', 'error', Date.now() - startTime);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    
    setLoading(true);
    setError('');
    const startTime = Date.now();
    logApiCall('/api/todos', 'POST', 'loading');
    
    try {
      const response = await fetch(`${API_BASE}/api/todos`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTodo, completed: false })
      });
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newTodoItem = await response.json();
      setNewTodo('');
      updateApiCallStatus('/api/todos', 'success', responseTime);
      
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
      updateApiCallStatus('/api/todos', 'error', Date.now() - startTime);
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
    const startTime = Date.now();
    logApiCall(`/api/todos/${id}`, 'DELETE', 'loading');
    
    try {
      const response = await fetch(`${API_BASE}/api/todos/${id}`, {
        method: 'DELETE',
      });
      
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      updateApiCallStatus(`/api/todos/${id}`, 'success', responseTime);
      await fetchTodos();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting todo:', error);
      setError('Failed to delete todo. Please try again.');
      updateApiCallStatus(`/api/todos/${id}`, 'error', Date.now() - startTime);
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

        {/* Container Network Activity Dashboard */}
        <div className="network-activity-dashboard">
          <h3>🔗 Container Communication</h3>
          <div className="container-info">
            <div className="container-card frontend">
              <div className="container-title">🌐 Frontend Container</div>
              <div className="container-details">React (nginx) - Port 3000</div>
              <div className="container-status">✅ Active</div>
            </div>
            <div className="network-arrow">
              <div className={`arrow ${activeRequests > 0 ? 'active' : ''}`}>
                {activeRequests > 0 ? '🔄' : '➡️'}
              </div>
              <div className="network-label">
                {activeRequests > 0 ? `${activeRequests} Active API Calls` : 'API Calls'}
              </div>
            </div>
            <div className="container-card backend">
              <div className="container-title">⚙️ Backend Container</div>
              <div className="container-details">Node.js API - Port 3001</div>
              <div className="container-status">
                {systemHealth?.status === 'healthy' ? '✅ Healthy' : '❌ Unhealthy'}
              </div>
            </div>
          </div>
          
          {/* Recent API Calls - Categorized */}
          <div className="api-calls-log">
            <h4>📡 Recent API Activity</h4>
            {networkActivity.length > 0 ? (
              <div className="api-calls-categories">
                {/* Health API Calls */}
                <div className="api-category">
                  <h5>🏥 Health</h5>
                  <div className="api-calls-column">
                    {networkActivity
                      .filter(call => call.endpoint.includes('/health'))
                      .slice(0, 3)
                      .map((call) => (
                        <div key={call.id} className={`api-call-box health ${call.status}`}>
                          <div className="api-call-header">
                            <div className="api-call-method">{call.method}</div>
                            <div className="api-call-status-icon">
                              {call.status === 'loading' && '⏳'}
                              {call.status === 'success' && '✅'}
                              {call.status === 'error' && '❌'}
                            </div>
                          </div>
                          <div className="api-call-endpoint">{call.endpoint}</div>
                          <div className="api-call-details">
                            <div className="api-call-status">
                              {call.status === 'loading' && 'Loading...'}
                              {call.status === 'success' && `${call.responseTime}ms`}
                              {call.status === 'error' && 'Error'}
                            </div>
                            <div className="api-call-time">
                              {call.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    {networkActivity.filter(call => call.endpoint.includes('/health')).length === 0 && (
                      <div className="no-activity-small">No health checks yet</div>
                    )}
                  </div>
                </div>

                {/* Stats API Calls */}
                <div className="api-category">
                  <h5>📊 Stats</h5>
                  <div className="api-calls-column">
                    {networkActivity
                      .filter(call => call.endpoint.includes('/stats'))
                      .slice(0, 3)
                      .map((call) => (
                        <div key={call.id} className={`api-call-box stats ${call.status}`}>
                          <div className="api-call-header">
                            <div className="api-call-method">{call.method}</div>
                            <div className="api-call-status-icon">
                              {call.status === 'loading' && '⏳'}
                              {call.status === 'success' && '✅'}
                              {call.status === 'error' && '❌'}
                            </div>
                          </div>
                          <div className="api-call-endpoint">{call.endpoint}</div>
                          <div className="api-call-details">
                            <div className="api-call-status">
                              {call.status === 'loading' && 'Loading...'}
                              {call.status === 'success' && `${call.responseTime}ms`}
                              {call.status === 'error' && 'Error'}
                            </div>
                            <div className="api-call-time">
                              {call.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    {networkActivity.filter(call => call.endpoint.includes('/stats')).length === 0 && (
                      <div className="no-activity-small">No stats requests yet</div>
                    )}
                  </div>
                </div>

                {/* Todos API Calls */}
                <div className="api-category">
                  <h5>📝 Todos</h5>
                  <div className="api-calls-column">
                    {networkActivity
                      .filter(call => call.endpoint.includes('/todos') || call.endpoint.includes('/api/todos'))
                      .slice(0, 3)
                      .map((call) => (
                        <div key={call.id} className={`api-call-box todos ${call.status}`}>
                          <div className="api-call-header">
                            <div className="api-call-method">{call.method}</div>
                            <div className="api-call-status-icon">
                              {call.status === 'loading' && '⏳'}
                              {call.status === 'success' && '✅'}
                              {call.status === 'error' && '❌'}
                            </div>
                          </div>
                          <div className="api-call-endpoint">{call.endpoint}</div>
                          <div className="api-call-details">
                            <div className="api-call-status">
                              {call.status === 'loading' && 'Loading...'}
                              {call.status === 'success' && `${call.responseTime}ms`}
                              {call.status === 'error' && 'Error'}
                            </div>
                            <div className="api-call-time">
                              {call.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    {networkActivity.filter(call => call.endpoint.includes('/todos') || call.endpoint.includes('/api/todos')).length === 0 && (
                      <div className="no-activity-small">No todo operations yet</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-activity">No recent API activity</div>
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
        
        {/* Interactive Architecture Diagram */}
        <div className="architecture-diagram">
          <h3>🏗️ Azure Container Apps Architecture</h3>
          <div className="architecture-container">
            
            {/* User/Browser Layer */}
            <div className="architecture-layer user-layer">
              <div className="layer-title">👤 User Layer</div>
              <div className="component user-browser">
                <div className="component-icon">🌐</div>
                <div className="component-title">Web Browser</div>
                <div className="component-details">User Interface</div>
              </div>
            </div>

            {/* Network Flow Arrow */}
            <div className={`flow-arrow vertical ${activeRequests > 0 ? 'active-flow' : ''}`}>
              <div className="arrow-line"></div>
              <div className="arrow-head">▼</div>
              <div className="flow-label">HTTPS</div>
            </div>

            {/* Azure Container Apps Environment */}
            <div className="architecture-layer azure-layer">
              <div className="layer-title">☁️ Azure Container Apps Environment</div>
              
              <div className="container-apps-row">
                {/* Frontend Container App */}
                <div className="container-app frontend-app">
                  <div className="app-header">
                    <div className="app-icon">🌐</div>
                    <div className="app-title">Frontend Container App</div>
                  </div>
                  <div className="container-details">
                    <div className="container-image">📦 React + nginx</div>
                    <div className="container-port">🔌 Port 3000</div>
                    <div className="ingress-info">🌍 External Ingress</div>
                  </div>
                  <div className="scaling-info">
                    <div className="replica-count">🔄 1-10 replicas</div>
                    <div className="scaling-rule">📊 HTTP scaling</div>
                  </div>
                </div>

                {/* API Flow Arrow */}
                <div className={`flow-arrow horizontal ${activeRequests > 0 ? 'active-flow' : ''}`}>
                  <div className="arrow-line-h"></div>
                  <div className="arrow-head-h">▶</div>
                  <div className="flow-label-h">
                    <div>API Calls</div>
                    <div className="api-count">{activeRequests > 0 ? `${activeRequests} active` : 'REST API'}</div>
                  </div>
                </div>

                {/* Backend Container App */}
                <div className="container-app backend-app">
                  <div className="app-header">
                    <div className="app-icon">⚙️</div>
                    <div className="app-title">Backend Container App</div>
                  </div>
                  <div className="container-details">
                    <div className="container-image">📦 Node.js + Express</div>
                    <div className="container-port">🔌 Port 3001</div>
                    <div className="ingress-info">🔒 Internal Ingress</div>
                  </div>
                  <div className="scaling-info">
                    <div className="replica-count">🔄 1-5 replicas</div>
                    <div className="scaling-rule">📊 CPU scaling</div>
                  </div>
                </div>
              </div>

              {/* DAPR Sidecar Layer */}
              <div className="dapr-layer">
                <div className="dapr-title">🔧 DAPR Sidecars</div>
                <div className="dapr-components">
                  <div className="dapr-sidecar frontend-dapr">
                    <div className="sidecar-icon">🔧</div>
                    <div className="sidecar-name">Frontend DAPR</div>
                    <div className="sidecar-port">:3500</div>
                  </div>
                  
                  <div className={`dapr-flow ${activeRequests > 0 ? 'active-dapr-flow' : ''}`}>
                    <div className="dapr-arrow">⟷</div>
                    <div className="dapr-protocol">Service Invocation</div>
                  </div>
                  
                  <div className="dapr-sidecar backend-dapr">
                    <div className="sidecar-icon">🔧</div>
                    <div className="sidecar-name">Backend DAPR</div>
                    <div className="sidecar-port">:3500</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Flow Arrow */}
            <div className={`flow-arrow vertical ${networkActivity.some(call => call.endpoint.includes('/api/todos') && call.status === 'loading') ? 'active-flow' : ''}`}>
              <div className="arrow-line"></div>
              <div className="arrow-head">▼</div>
              <div className="flow-label">State Management</div>
            </div>

            {/* Data Layer */}
            <div className="architecture-layer data-layer">
              <div className="layer-title">💾 Data & State Management</div>
              <div className="data-components">
                <div className="data-component state-store">
                  <div className="data-icon">🗄️</div>
                  <div className="data-title">DAPR State Store</div>
                  <div className="data-details">
                    <div>Azure Cosmos DB</div>
                    <div>or Redis Cache</div>
                  </div>
                  <div className="data-status">
                    {systemHealth?.dapr?.enabled ? '✅ Enabled' : '🔄 In-Memory (Demo)'}
                  </div>
                </div>
                
                <div className="data-component pub-sub">
                  <div className="data-icon">📡</div>
                  <div className="data-title">DAPR Pub/Sub</div>
                  <div className="data-details">
                    <div>Azure Service Bus</div>
                    <div>Event Messaging</div>
                  </div>
                  <div className="data-status">
                    {systemHealth?.dapr?.enabled ? '✅ Enabled' : '⏸️ Disabled (Demo)'}
                  </div>
                </div>

                <div className="data-component secrets">
                  <div className="data-icon">🔐</div>
                  <div className="data-title">Azure Key Vault</div>
                  <div className="data-details">
                    <div>Secrets Management</div>
                    <div>Certificates</div>
                  </div>
                  <div className="data-status">🔒 Secured</div>
                </div>
              </div>
            </div>

            {/* Infrastructure Layer */}
            <div className="architecture-layer infra-layer">
              <div className="layer-title">🏗️ Azure Infrastructure</div>
              <div className="infra-components">
                <div className="infra-component">
                  <div className="infra-icon">📊</div>
                  <div className="infra-title">Log Analytics</div>
                  <div className="infra-details">Monitoring & Logs</div>
                </div>
                
                <div className="infra-component">
                  <div className="infra-icon">📦</div>
                  <div className="infra-title">Container Registry</div>
                  <div className="infra-details">Image Storage</div>
                </div>
                
                <div className="infra-component">
                  <div className="infra-icon">🔗</div>
                  <div className="infra-title">Virtual Network</div>
                  <div className="infra-details">Network Isolation</div>
                </div>
                
                <div className="infra-component">
                  <div className="infra-icon">🛡️</div>
                  <div className="infra-title">Managed Identity</div>
                  <div className="infra-details">Secure Authentication</div>
                </div>
              </div>
            </div>

            {/* Real-time Activity Indicators */}
            <div className="activity-indicators">
              <div className="activity-title">📈 Real-time Activity</div>
              <div className="activity-stats">
                <div className="activity-stat">
                  <span className="stat-label">Active Requests:</span>
                  <span className={`stat-value ${activeRequests > 0 ? 'active' : ''}`}>{activeRequests}</span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">System Status:</span>
                  <span className={`stat-value ${systemHealth?.status === 'healthy' ? 'healthy' : 'unhealthy'}`}>
                    {systemHealth?.status === 'healthy' ? '🟢 Healthy' : '🔴 Unhealthy'}
                  </span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">DAPR Status:</span>
                  <span className={`stat-value ${systemHealth?.dapr?.enabled ? 'enabled' : 'disabled'}`}>
                    {systemHealth?.dapr?.enabled ? '🟢 Enabled' : '🟡 Demo Mode'}
                  </span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">Total API Calls:</span>
                  <span className="stat-value">{networkActivity.length}</span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">Health Checks:</span>
                  <span className="stat-value health-count">
                    {networkActivity.filter(call => call.endpoint.includes('/health')).length}
                  </span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">Stats Requests:</span>
                  <span className="stat-value stats-count">
                    {networkActivity.filter(call => call.endpoint.includes('/stats')).length}
                  </span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">Todo Operations:</span>
                  <span className="stat-value todos-count">
                    {networkActivity.filter(call => call.endpoint.includes('/todos')).length}
                  </span>
                </div>
                <div className="activity-stat">
                  <span className="stat-label">Last API Call:</span>
                  <span className="stat-value">
                    {networkActivity.length > 0 ? networkActivity[0].timestamp.toLocaleTimeString() : 'None'}
                  </span>
                </div>
              </div>
              
              {/* Recent Activity Flow */}
              {networkActivity.length > 0 && (
                <div className="recent-activity-flow">
                  <div className="flow-title">🔄 Recent Activity Flow</div>
                  <div className="activity-flow-items">
                    {networkActivity.slice(0, 5).map((call, index) => (
                      <div key={call.id} className={`flow-item ${call.type} ${call.status}`} style={{ animationDelay: `${index * 0.1}s` }}>
                        <div className="flow-item-type">
                          {call.type === 'health' && '🏥'}
                          {call.type === 'stats' && '📊'}
                          {call.type === 'todos' && '📝'}
                        </div>
                        <div className="flow-item-details">
                          <div className="flow-item-method">{call.method}</div>
                          <div className="flow-item-endpoint">{call.endpoint}</div>
                          <div className="flow-item-time">{call.timestamp.toLocaleTimeString()}</div>
                        </div>
                        <div className="flow-item-status">
                          {call.status === 'loading' && '⏳'}
                          {call.status === 'success' && '✅'}
                          {call.status === 'error' && '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
