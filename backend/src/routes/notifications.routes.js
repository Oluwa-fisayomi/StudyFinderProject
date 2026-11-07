
import express from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

// -------------------------
// GET USER NOTIFICATIONS
// GET /api/notifications
// -------------------------

router.get('/', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 20)
    )

    const unreadOnly = req.query.unreadOnly === 'true'

    const where = {
      userId: req.user.id,
      ...(unreadOnly && { isRead: false }),
    }

    const [notifications, total, unreadCount] = await prisma.$transaction([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),

      prisma.notification.count({ where }),

      prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false,
        },
      }),
    ])

    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully.',
      notifications,
      unreadCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get notifications error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve notifications.',
    })
  }
})

// -------------------------
// GET UNREAD NOTIFICATION COUNT
// GET /api/notifications/unread-count
// -------------------------

router.get('/unread-count', requireAuth, async (req, res) => {
  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    })

    return res.status(200).json({
      success: true,
      unreadCount,
    })
  } catch (error) {
    console.error('Unread notification count error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve unread notification count.',
    })
  }
})

// -------------------------
// MARK ONE NOTIFICATION AS READ
// PATCH /api/notifications/:id/read
// -------------------------

router.patch('/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.',
      })
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      })
    }

    const updatedNotification = notification.isRead
      ? notification
      : await prisma.notification.update({
          where: { id },
          data: { isRead: true },
        })

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      notification: updatedNotification,
    })
  } catch (error) {
    console.error('Mark notification as read error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update notification.',
    })
  }
})

// -------------------------
// MARK ALL NOTIFICATIONS AS READ
// PATCH /api/notifications/read-all
// -------------------------

router.patch('/read-all', requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
      updatedCount: result.count,
    })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update notifications.',
    })
  }
})

// -------------------------
// DELETE ONE NOTIFICATION
// DELETE /api/notifications/:id
// -------------------------

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification ID.',
      })
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      select: {
        id: true,
      },
    })

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      })
    }

    await prisma.notification.delete({
      where: { id },
    })

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully.',
    })
  } catch (error) {
    console.error('Delete notification error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete notification.',
    })
  }
})

export default router
