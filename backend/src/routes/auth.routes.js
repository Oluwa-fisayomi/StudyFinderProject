
import express from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { randomBytes, createHash } from 'node:crypto'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

// Limit repeated registration attempts
const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again later.'
  }
})

// Limit repeated login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 2000,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
})

// Username validation
const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(20)
  .regex(/^[a-zA-Z0-9_]+$/)

// Registration validation
const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  username: usernameSchema,
  email: z.string().trim().email().max(254),
  password: z.string()
    .min(8)
    .refine(
      (value) => Buffer.byteLength(value, 'utf8') <= 72,
      'Password must not exceed 72 bytes.'
    ),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match.',
    path: ['confirmPassword']
  }
)

// Login validation
const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
  rememberMe: z.boolean().default(false)
})

// Session settings
const SESSION_COOKIE_NAME = 'studyfinder_session'
const SHORT_SESSION_DURATION = 12 * 60 * 60 * 1000
const LONG_SESSION_DURATION = 30 * 24 * 60 * 60 * 1000

function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

function getCookieOptions(expiresAt) {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    expires: expiresAt
  }
}

// Check username availability
router.get('/username-availability', async (req, res) => {
  try {
    const validation = usernameSchema.safeParse(req.query.username)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        available: false,
        message: 'Username must be 3–20 characters and contain only letters, numbers, or underscores.'
      })
    }

    const username = validation.data.toLowerCase()

    const existingUser = await prisma.profile.findUnique({
      where: { username },
      select: { id: true }
    })

    return res.status(200).json({
      success: true,
      available: !existingUser,
      message: existingUser
        ? 'Username is already taken.'
        : 'Username is available.'
    })

  } catch (error) {
    console.error('Username availability error:', error)

    return res.status(500).json({
      success: false,
      available: false,
      message: 'Unable to check username availability. Please try again.'
    })
  }
})

// Create a new account
router.post('/register', registrationLimiter, async (req, res) => {
  try {
    const validation = registrationSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please check your registration details.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    const {
      fullName,
      username,
      email,
      password
    } = validation.data

    const cleanUsername = username.toLowerCase()
    const cleanEmail = email.toLowerCase()

    const nameParts = fullName.trim().split(/\s+/)

    if (nameParts.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both your first name and last name.'
      })
    }

    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        field: 'email',
        message: 'An account with this email already exists.'
      })
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { username: cleanUsername },
      select: { id: true }
    })

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        field: 'username',
        message: 'This username is already taken.'
      })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        profile: {
          create: {
            firstName,
            lastName,
            username: cleanUsername
          }
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    })

    return res.status(201).json({
      success: true,
      message: 'Your StudyFinder account has been created successfully.',
      user
    })

  } catch (error) {
    if (error.code === 'P2002') {
      const target = error.meta?.target
      const targetText = Array.isArray(target)
        ? target.join(' ')
        : String(target || '')

      if (targetText.toLowerCase().includes('email')) {
        return res.status(409).json({
          success: false,
          field: 'email',
          message: 'An account with this email already exists.'
        })
      }

      if (targetText.toLowerCase().includes('username')) {
        return res.status(409).json({
          success: false,
          field: 'username',
          message: 'This username is already taken.'
        })
      }

      return res.status(409).json({
        success: false,
        message: 'Some of your registration details are already in use.'
      })
    }

    console.error('Registration error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create your account right now. Please try again.'
    })
  }
})

// Login to an existing account
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address and password.'
      })
    }

    const { email, password, rememberMe } = validation.data

    const cleanEmail = email.toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        profile: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            avatarUrl: true
          }
        }
      }
    })

    // Use the same response for unknown emails and incorrect passwords
    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    )

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'This account is currently unavailable. Please contact support.'
      })
    }

    // Generate a secure random session token
    const sessionToken = randomBytes(32).toString('hex')

    // Store only the SHA-256 hash in the database
    const tokenHash = hashSessionToken(sessionToken)

    const sessionDuration = rememberMe
      ? LONG_SESSION_DURATION
      : SHORT_SESSION_DURATION

    const expiresAt = new Date(Date.now() + sessionDuration)

    // Create the session in PostgreSQL
    await prisma.session.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    })

    // Send the original token in an HTTP-only cookie
    res.cookie(
      SESSION_COOKIE_NAME,
      sessionToken,
      getCookieOptions(expiresAt)
    )

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile
      }
    })

  } catch (error) {
    console.error('Login error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to log in right now. Please try again.'
    })
  }
})

// Get the currently authenticated user
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  })
})

// Log out the authenticated user
router.post('/logout', requireAuth, async (req, res) => {
  try {
    // Delete the current session from PostgreSQL
    await prisma.session.delete({
      where: {
        id: req.session.id
      }
    })

    // Remove the session cookie from the browser
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    })

    return res.status(200).json({
      success: true,
      message: 'You have logged out successfully.'
    })

  } catch (error) {
    console.error('Logout error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to log out. Please try again.'
    })
  }
})

export default router
