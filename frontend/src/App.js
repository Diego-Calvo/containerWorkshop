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
  const [architectureView, setArchitectureView] = useState('journey'); // journey, technical, data-flow
  
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
        
        {/* Revolutionary Azure Container Apps Architecture Visualization */}
        <div className="architecture-ecosystem">
          <div className="ecosystem-header">
            <h3 className="ecosystem-title">
              <span className="title-icon">🌟</span>
              Azure Container Apps Ecosystem
              <span className="title-subtitle">Living Architecture in Action</span>
            </h3>
            <div className="ecosystem-controls">
              <button 
                className={`view-toggle ${architectureView === 'journey' ? 'active' : ''}`}
                onClick={() => setArchitectureView('journey')}
              >
                🚀 User Journey
              </button>
              <button 
                className={`view-toggle ${architectureView === 'technical' ? 'active' : ''}`}
                onClick={() => setArchitectureView('technical')}
              >
                🔧 Technical View
              </button>
              <button 
                className={`view-toggle ${architectureView === 'data-flow' ? 'active' : ''}`}
                onClick={() => setArchitectureView('data-flow')}
              >
                📊 Data Flow
              </button>
            </div>
          </div>

          {/* User Journey View */}
          {architectureView === 'journey' && (
            <div className="journey-visualization">
              <div className="journey-timeline">
                <div className="timeline-step active">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <div className="step-icon">👤</div>
                    <h4>User Interaction</h4>
                    <p>You interact with the beautiful React interface</p>
                    <div className="step-metrics">
                      <span className="metric">Response: &lt;100ms</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-connector">
                  <div className={`connector-line ${activeRequests > 0 ? 'pulsing' : ''}`}></div>
                  <div className="connector-icon">🌐</div>
                </div>

                <div className={`timeline-step ${activeRequests > 0 ? 'active' : ''}`}>
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <div className="step-icon">⚡</div>
                    <h4>Container Apps Magic</h4>
                    <p>Your request travels through Azure's intelligent routing</p>
                    <div className="step-metrics">
                      <span className="metric">Scale: 1-10 instances</span>
                      <span className="metric">Load balancing active</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-connector">
                  <div className={`connector-line ${activeRequests > 0 ? 'pulsing' : ''}`}></div>
                  <div className="connector-icon">🔄</div>
                </div>

                <div className={`timeline-step ${networkActivity.some(call => call.endpoint.includes('/api/')) ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <div className="step-icon">🤖</div>
                    <h4>DAPR Intelligence</h4>
                    <p>Distributed Application Runtime handles the complexity</p>
                    <div className="step-metrics">
                      <span className="metric">Service discovery</span>
                      <span className="metric">State management</span>
                    </div>
                  </div>
                </div>

                <div className="timeline-connector">
                  <div className="connector-line"></div>
                  <div className="connector-icon">💾</div>
                </div>

                <div className="timeline-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <div className="step-icon">✨</div>
                    <h4>Data Persistence</h4>
                    <p>Your data is safely stored and instantly available</p>
                    <div className="step-metrics">
                      <span className="metric">Cosmos DB ready</span>
                      <span className="metric">Redis caching</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="journey-insights">
                <div className="insight-card">
                  <div className="insight-icon">🎯</div>
                  <h5>Why Container Apps?</h5>
                  <p>Serverless containers that scale automatically, no K8s complexity</p>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">🚀</div>
                  <h5>DAPR Benefits</h5>
                  <p>Building blocks for microservices without vendor lock-in</p>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">💰</div>
                  <h5>Cost Efficiency</h5>
                  <p>Pay only for what you use, scale to zero when idle</p>
                </div>
              </div>
            </div>
          )}

          {/* Technical View */}
          {architectureView === 'technical' && (
            <div className="technical-blueprint">
              <div className="blueprint-layers">
                
                {/* Presentation Layer */}
                <div className="layer-card presentation-layer">
                  <div className="layer-header">
                    <span className="layer-icon">🎨</span>
                    <h4>Presentation Layer</h4>
                    <span className="layer-status healthy">Live</span>
                  </div>
                  <div className="layer-components">
                    <div className="component-pill">
                      <span className="pill-icon">⚛️</span>
                      React 18
                    </div>
                    <div className="component-pill">
                      <span className="pill-icon">🎯</span>
                      Tailwind CSS
                    </div>
                    <div className="component-pill">
                      <span className="pill-icon">📱</span>
                      Progressive Web App
                    </div>
                  </div>
                  <div className="layer-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Bundle Size:</span>
                      <span className="metric-value">7.23 KB gzipped</span>
                    </div>
                    <div className="metric-item">
                      <span className="metric-label">Performance:</span>
                      <span className="metric-value">Lighthouse 95+</span>
                    </div>
                  </div>
                </div>

                <div className="layer-separator">
                  <div className="separator-line"></div>
                  <div className="separator-icon">🔀</div>
                </div>

                {/* Container Apps Layer */}
                <div className="layer-card container-layer">
                  <div className="layer-header">
                    <span className="layer-icon">📦</span>
                    <h4>Azure Container Apps</h4>
                    <span className="layer-status scaling">Auto-scaling</span>
                  </div>
                  
                  <div className="container-topology">
                    <div className="topology-node frontend-node">
                      <div className="node-header">
                        <span className="node-icon">🌐</span>
                        <span className="node-title">Frontend App</span>
                      </div>
                      <div className="node-details">
                        <div className="detail-row">
                          <span className="detail-label">Image:</span>
                          <span className="detail-value">nginx:alpine</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Replicas:</span>
                          <span className="detail-value">1-10</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">CPU:</span>
                          <span className="detail-value">0.25-2.0 vCPU</span>
                        </div>
                      </div>
                    </div>

                    <div className={`connection-flow ${activeRequests > 0 ? 'active-connection' : ''}`}>
                      <div className="flow-line"></div>
                      <div className="flow-indicator">
                        <span className="indicator-icon">🔄</span>
                        <span className="indicator-text">
                          {activeRequests > 0 ? `${activeRequests} active` : 'REST API'}
                        </span>
                      </div>
                    </div>

                    <div className="topology-node backend-node">
                      <div className="node-header">
                        <span className="node-icon">⚙️</span>
                        <span className="node-title">Backend App</span>
                      </div>
                      <div className="node-details">
                        <div className="detail-row">
                          <span className="detail-label">Image:</span>
                          <span className="detail-value">node:18-alpine</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Replicas:</span>
                          <span className="detail-value">1-5</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Memory:</span>
                          <span className="detail-value">0.5-4.0 Gi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="layer-separator">
                  <div className="separator-line"></div>
                  <div className="separator-icon">🔧</div>
                </div>

                {/* DAPR Layer */}
                <div className="layer-card dapr-layer">
                  <div className="layer-header">
                    <span className="layer-icon">🤖</span>
                    <h4>DAPR Runtime</h4>
                    <span className={`layer-status ${systemHealth?.dapr?.enabled ? 'enabled' : 'demo'}`}>
                      {systemHealth?.dapr?.enabled ? 'Production' : 'Demo Mode'}
                    </span>
                  </div>
                  <div className="dapr-building-blocks">
                    <div className="building-block">
                      <span className="block-icon">🔗</span>
                      <span className="block-name">Service Invocation</span>
                      <span className="block-status active">Active</span>
                    </div>
                    <div className="building-block">
                      <span className="block-icon">💾</span>
                      <span className="block-name">State Management</span>
                      <span className={`block-status ${systemHealth?.dapr?.enabled ? 'active' : 'simulated'}`}>
                        {systemHealth?.dapr?.enabled ? 'Cosmos DB' : 'In-Memory'}
                      </span>
                    </div>
                    <div className="building-block">
                      <span className="block-icon">📡</span>
                      <span className="block-name">Pub/Sub</span>
                      <span className="block-status ready">Service Bus Ready</span>
                    </div>
                    <div className="building-block">
                      <span className="block-icon">🔐</span>
                      <span className="block-name">Secrets</span>
                      <span className="block-status secured">Key Vault</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="blueprint-sidebar">
                <div className="sidebar-card">
                  <h5>🎯 Architecture Benefits</h5>
                  <ul className="benefit-list">
                    <li>Zero infrastructure management</li>
                    <li>Built-in load balancing</li>
                    <li>Automatic HTTPS termination</li>
                    <li>Integrated monitoring</li>
                    <li>Blue-green deployments</li>
                  </ul>
                </div>
                
                <div className="sidebar-card">
                  <h5>📊 Real-time Metrics</h5>
                  <div className="live-metrics">
                    <div className="metric-display">
                      <span className="metric-icon">🔄</span>
                      <span className="metric-text">Active Requests</span>
                      <span className="metric-number">{activeRequests}</span>
                    </div>
                    <div className="metric-display">
                      <span className="metric-icon">📈</span>
                      <span className="metric-text">Total API Calls</span>
                      <span className="metric-number">{networkActivity.length}</span>
                    </div>
                    <div className="metric-display">
                      <span className="metric-icon">⚡</span>
                      <span className="metric-text">Avg Response</span>
                      <span className="metric-number">
                        {networkActivity.length > 0 
                          ? Math.round(networkActivity.reduce((sum, call) => sum + (call.responseTime || 0), 0) / networkActivity.length)
                          : 0}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Flow View */}
          {architectureView === 'data-flow' && (
            <div className="dataflow-visualization">
              <div className="flow-diagram">
                <div className="flow-stage user-stage">
                  <div className="stage-header">
                    <span className="stage-icon">👨‍💻</span>
                    <h4>User Action</h4>
                  </div>
                  <div className="stage-content">
                    <div className="action-types">
                      <div className={`action-type ${networkActivity.some(call => call.method === 'GET') ? 'active' : ''}`}>
                        <span className="action-icon">👁️</span>
                        <span className="action-name">View Data</span>
                      </div>
                      <div className={`action-type ${networkActivity.some(call => call.method === 'POST') ? 'active' : ''}`}>
                        <span className="action-icon">➕</span>
                        <span className="action-name">Create Todo</span>
                      </div>
                      <div className={`action-type ${networkActivity.some(call => call.method === 'PUT') ? 'active' : ''}`}>
                        <span className="action-icon">✏️</span>
                        <span className="action-name">Update Todo</span>
                      </div>
                      <div className={`action-type ${networkActivity.some(call => call.method === 'DELETE') ? 'active' : ''}`}>
                        <span className="action-icon">🗑️</span>
                        <span className="action-name">Delete Todo</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-transition">
                  <div className={`transition-arrow ${activeRequests > 0 ? 'flowing' : ''}`}>
                    <div className="arrow-body"></div>
                    <div className="arrow-head">▶</div>
                  </div>
                  <div className="transition-label">HTTP Request</div>
                </div>

                <div className="flow-stage processing-stage">
                  <div className="stage-header">
                    <span className="stage-icon">⚡</span>
                    <h4>Container Processing</h4>
                  </div>
                  <div className="stage-content">
                    <div className="processing-pipeline">
                      <div className="pipeline-step">
                        <span className="step-icon">🌐</span>
                        <span className="step-name">Ingress Controller</span>
                        <span className="step-status">Routing</span>
                      </div>
                      <div className="pipeline-arrow">→</div>
                      <div className="pipeline-step">
                        <span className="step-icon">📦</span>
                        <span className="step-name">Frontend Container</span>
                        <span className="step-status">React SPA</span>
                      </div>
                      <div className="pipeline-arrow">→</div>
                      <div className="pipeline-step">
                        <span className="step-icon">🔧</span>
                        <span className="step-name">DAPR Sidecar</span>
                        <span className="step-status">Service Discovery</span>
                      </div>
                      <div className="pipeline-arrow">→</div>
                      <div className="pipeline-step">
                        <span className="step-icon">⚙️</span>
                        <span className="step-name">Backend Container</span>
                        <span className="step-status">API Processing</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flow-transition">
                  <div className={`transition-arrow ${networkActivity.some(call => call.endpoint.includes('/api/todos')) ? 'flowing' : ''}`}>
                    <div className="arrow-body"></div>
                    <div className="arrow-head">▼</div>
                  </div>
                  <div className="transition-label">Data Operation</div>
                </div>

                <div className="flow-stage storage-stage">
                  <div className="stage-header">
                    <span className="stage-icon">💾</span>
                    <h4>Data Persistence</h4>
                  </div>
                  <div className="stage-content">
                    <div className="storage-options">
                      <div className={`storage-option ${systemHealth?.dapr?.enabled ? 'active' : 'inactive'}`}>
                        <span className="storage-icon">🌌</span>
                        <div className="storage-details">
                          <span className="storage-name">Azure Cosmos DB</span>
                          <span className="storage-desc">Production NoSQL Database</span>
                        </div>
                        <span className="storage-status">{systemHealth?.dapr?.enabled ? 'Active' : 'Ready'}</span>
                      </div>
                      <div className={`storage-option ${!systemHealth?.dapr?.enabled ? 'active' : 'inactive'}`}>
                        <span className="storage-icon">🧠</span>
                        <div className="storage-details">
                          <span className="storage-name">In-Memory Store</span>
                          <span className="storage-desc">Demo Mode Storage</span>
                        </div>
                        <span className="storage-status">{!systemHealth?.dapr?.enabled ? 'Active' : 'Standby'}</span>
                      </div>
                      <div className="storage-option ready">
                        <span className="storage-icon">⚡</span>
                        <div className="storage-details">
                          <span className="storage-name">Redis Cache</span>
                          <span className="storage-desc">High-Performance Caching</span>
                        </div>
                        <span className="storage-status">Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="dataflow-analytics">
                <div className="analytics-panel">
                  <h5>📊 Data Flow Analytics</h5>
                  <div className="analytics-grid">
                    <div className="analytics-card">
                      <span className="analytics-icon">📈</span>
                      <div className="analytics-content">
                        <span className="analytics-value">{todos.length}</span>
                        <span className="analytics-label">Total Records</span>
                      </div>
                    </div>
                    <div className="analytics-card">
                      <span className="analytics-icon">⚡</span>
                      <div className="analytics-content">
                        <span className="analytics-value">
                          {networkActivity.length > 0 
                            ? Math.round(networkActivity.reduce((sum, call) => sum + (call.responseTime || 0), 0) / networkActivity.length)
                            : 0}ms
                        </span>
                        <span className="analytics-label">Avg Latency</span>
                      </div>
                    </div>
                    <div className="analytics-card">
                      <span className="analytics-icon">🔄</span>
                      <div className="analytics-content">
                        <span className="analytics-value">{networkActivity.filter(call => call.status === 'success').length}</span>
                        <span className="analytics-label">Successful Ops</span>
                      </div>
                    </div>
                    <div className="analytics-card">
                      <span className="analytics-icon">💾</span>
                      <div className="analytics-content">
                        <span className="analytics-value">{systemHealth?.dapr?.enabled ? 'Persistent' : 'Volatile'}</span>
                        <span className="analytics-label">Storage Mode</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
