
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import prisma from './src/lib/prisma.js'
import { startSessionCleanup } from './src/jobs/session-cleanup.js'

import authRoutes from './src/routes/auth.routes.js'
import groupRoutes from './src/routes/groups.routes.js'
import adminRoutes from './src/routes/admin.routes.js'
import notificationRoutes from './src/routes/notifications.routes.js'
import profileRoutes from './src/routes/profile.routes.js'

dotenv.config()

const app = express()
const PORT = Number(process.env.PORT) || 5000

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5176',
  'http://localhost:5180',
  ...(process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]

// Security middleware
app.use(helmet())

// CORS configuration
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origin not allowed by CORS'))
  },
  credentials: true,
}))

// Request parsing
app.use(express.json({ limit: '100kb' }))
app.use(cookieParser())

// Welcome route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the StudyFinder API!',
  })
})

// Backend health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyFinder backend is running.',
    status: 'healthy',
  })
})

// Database health check
app.get('/api/health/database', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`

    res.status(200).json({
      success: true,
      message: 'Database connection successful.',
      database: 'connected',
    })
  } catch (error) {
    console.error('Database connection error:', error)

    res.status(503).json({
      success: false,
      message: 'Database connection failed.',
      database: 'disconnected',
    })
  }
})

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
})

// Apply limit to normal API requests
app.use('/api', apiLimiter)

// Authentication routes
app.use('/api/auth', authRoutes)

// Study group routes
app.use('/api/groups', groupRoutes)

// Administrator routes
app.use('/api/admin', adminRoutes)

// Notification routes
app.use('/api/notifications', notificationRoutes)

// Profile routes
app.use('/api/profile', profileRoutes)

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
})

// Centralized error handler
app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error)
  }

  console.error('Request error:', error)

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON request body.',
    })
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Request body is too large. Maximum allowed size is 100kb.',
    })
  }

  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
  })
})

// Session cleanup scheduler shutdown function
let stopSessionCleanup = () => {}

// Start server
const server = app.listen(PORT, () => {
  console.log('================================')
  console.log('StudyFinder backend is running')
  console.log(`Server: http://localhost:${PORT}`)
  console.log(`Health: http://localhost:${PORT}/api/health`)
  console.log('API rate limit: 300 requests per 15 minutes')
  console.log('================================')

  stopSessionCleanup = startSessionCleanup()
})

// Handle server errors
server.on('error', async (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`ERROR: Port ${PORT} is already in use.`)
    console.error('Another application or backend instance may be using this port.')
  } else {
    console.error('Server startup error:', error.message)
  }

  stopSessionCleanup()
  await prisma.$disconnect()
  process.exit(1)
})

// Graceful shutdown
let isShuttingDown = false

async function shutdown(signal) {
  if (isShuttingDown) return

  isShuttingDown = true
  console.log(`\n${signal} received. Shutting down StudyFinder...`)

  stopSessionCleanup()

  server.close(async () => {
    try {
      await prisma.$disconnect()
      console.log('Database disconnected.')
      console.log('StudyFinder stopped successfully.')
      process.exit(0)
    } catch (error) {
      console.error('Shutdown error:', error)
      process.exit(1)
    }
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
