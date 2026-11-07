
import { createHash } from 'node:crypto'
import prisma from '../lib/prisma.js'

const SESSION_COOKIE_NAME = 'studyfinder_session'

function getCookieClearOptions() {
  const isProduction = process.env.NODE_ENV === 'production'

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  }
}

export async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME]

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in again.'
      })
    }

    const tokenHash = createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
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
        }
      }
    })

    if (!session) {
      res.clearCookie(
        SESSION_COOKIE_NAME,
        getCookieClearOptions()
      )

      return res.status(401).json({
        success: false,
        message: 'Your session is invalid. Please log in again.'
      })
    }

    if (session.expiresAt <= new Date()) {
      await prisma.session.delete({
        where: { id: session.id }
      })

      res.clearCookie(
        SESSION_COOKIE_NAME,
        getCookieClearOptions()
      )

      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      })
    }

    if (session.user.status !== 'ACTIVE') {
      await prisma.session.delete({
        where: { id: session.id }
      })

      res.clearCookie(
        SESSION_COOKIE_NAME,
        getCookieClearOptions()
      )

      return res.status(403).json({
        success: false,
        message: 'Your account is currently unavailable.'
      })
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      status: session.user.status,
      profile: session.user.profile
    }

    req.session = session

    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() }
    })

    return next()

  } catch (error) {
    console.error('Authentication middleware error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to verify your session.'
    })
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    })
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Administrator access required.'
    })
  }

  return next()
}
