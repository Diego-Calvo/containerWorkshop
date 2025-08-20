const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');

// DAPR imports
const { DaprClient } = require('@dapr/dapr');

const app = express();
const PORT = process.env.PORT || 3001;
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || 3500;
const STATE_STORE = process.env.STATE_STORE_NAME || 'statestore';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';

// Initialize DAPR client
let daprClient;
let isDaprAvailable = false;

// For demo purposes, disable DAPR to avoid connection timeouts
// In a real Azure Container Apps environment, DAPR would be available
const ENABLE_DAPR = process.env.ENABLE_DAPR === 'true' || false;

if (ENABLE_DAPR) {
  try {
    daprClient = new DaprClient({
      daprHost: process.env.DAPR_HOST || 'localhost',
      daprPort: DAPR_HTTP_PORT
    });
    isDaprAvailable = true;
    console.log('✅ DAPR client initialized');
  } catch (error) {
    console.log('⚠️ DAPR not available, using in-memory storage:', error.message);
  }
} else {
  console.log('📝 DAPR disabled for demo - using in-memory storage');
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:3000', 'http://localhost:80'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// In-memory fallback storage
let inMemoryTodos = [
  { 
    id: uuidv4(), 
    text: '🎉 Welcome to Azure Container Apps Workshop!', 
    completed: false,
    createdAt: new Date().toISOString()
  },
  { 
    id: uuidv4(), 
    text: '🔧 Edit this API to see live container updates', 
    completed: false,
    createdAt: new Date().toISOString()
  },
  { 
    id: uuidv4(), 
    text: '🚀 Deploy your changes and watch them update in real-time', 
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Helper functions for data persistence
async function getTodos() {
  if (isDaprAvailable) {
    try {
      const result = await daprClient.state.get(STATE_STORE, 'todos');
      return result || inMemoryTodos;
    } catch (error) {
      console.log('DAPR get failed, using in-memory:', error.message);
      return inMemoryTodos;
    }
  }
  return inMemoryTodos;
}

async function saveTodos(todos) {
  if (isDaprAvailable) {
    try {
      await daprClient.state.save(STATE_STORE, [
        {
          key: 'todos',
          value: todos
        }
      ]);
      console.log('✅ Todos saved to DAPR state store');
      return true;
    } catch (error) {
      console.log('DAPR save failed, using in-memory:', error.message);
      inMemoryTodos = todos;
      return false;
    }
  }
  inMemoryTodos = todos;
  return false;
}

// API Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await getTodos();
    res.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ 
      error: 'Failed to fetch todos',
      message: error.message 
    });
  }
});

// Add new todo
app.post('/api/todos', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({ 
        error: 'Todo text is required' 
      });
    }

    const newTodo = {
      id: uuidv4(),
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };

    const currentTodos = await getTodos();
    const updatedTodos = [...currentTodos, newTodo];
    
    await saveTodos(updatedTodos);
    
    res.status(201).json(newTodo);
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ 
      error: 'Failed to add todo',
      message: error.message 
    });
  }
});

// Toggle todo completion status
app.put('/api/todos/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentTodos = await getTodos();
    const todoIndex = currentTodos.findIndex(todo => todo.id === id);
    
    if (todoIndex === -1) {
      return res.status(404).json({ 
        error: 'Todo not found' 
      });
    }

    currentTodos[todoIndex].completed = !currentTodos[todoIndex].completed;
    currentTodos[todoIndex].updatedAt = new Date().toISOString();
    
    await saveTodos(currentTodos);
    
    res.json(currentTodos[todoIndex]);
  } catch (error) {
    console.error('Error toggling todo:', error);
    res.status(500).json({ 
      error: 'Failed to toggle todo',
      message: error.message 
    });
  }
});

// Delete todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const currentTodos = await getTodos();
    const filteredTodos = currentTodos.filter(todo => todo.id !== id);
    
    if (filteredTodos.length === currentTodos.length) {
      return res.status(404).json({ 
        error: 'Todo not found' 
      });
    }

    await saveTodos(filteredTodos);
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting todo:', error);
    res.status(500).json({ 
      error: 'Failed to delete todo',
      message: error.message 
    });
  }
});

// Get todo statistics (workshop exercise endpoint)
app.get('/api/stats', async (req, res) => {
  try {
    const todos = await getTodos();
    
    const stats = {
      total: todos.length,
      completed: todos.filter(todo => todo.completed).length,
      pending: todos.filter(todo => !todo.completed).length,
      lastUpdated: new Date().toISOString(),
      version: APP_VERSION,
      daprEnabled: isDaprAvailable
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ 
      error: 'Failed to get statistics',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: APP_VERSION,
    dapr: {
      enabled: isDaprAvailable,
      port: DAPR_HTTP_PORT
    },
    environment: {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime()
    }
  });
});

// Readiness probe
app.get('/ready', async (req, res) => {
  try {
    // Test basic functionality
    await getTodos();
    res.json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        dataAccess: 'ok',
        dapr: isDaprAvailable ? 'ok' : 'fallback'
      }
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'not ready',
      error: error.message 
    });
  }
});

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 DAPR enabled: ${isDaprAvailable}`);
  console.log(`📝 Version: ${APP_VERSION}`);
  console.log(`🌐 CORS origins: ${process.env.CORS_ORIGIN || 'localhost:3000,localhost:80'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
