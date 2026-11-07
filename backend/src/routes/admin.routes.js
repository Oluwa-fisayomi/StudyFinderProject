
import express from 'express'
import { z } from 'zod'

import prisma from '../lib/prisma.js'
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js'

const router = express.Router()

const userIdSchema = z.string().uuid()
const groupIdSchema = z.string().uuid()
const postIdSchema = z.string().uuid()

// -------------------------
// GET ALL REGISTERED USERS
// -------------------------

router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
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
            username: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    })
  } catch (error) {
    console.error('Admin users retrieval error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve registered users.'
    })
  }
})

// -------------------------
// SUSPEND OR ACTIVATE USERS
// -------------------------

const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED'])
})

router.patch('/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const idValidation = userIdSchema.safeParse(req.params.id)
    const validation = updateStatusSchema.safeParse(req.body)

    if (!idValidation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID.'
      })
    }

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account status. Use ACTIVE or SUSPENDED.'
      })
    }

    const targetUserId = idValidation.data
    const { status } = validation.data

    if (targetUserId === req.user.id && status === 'SUSPENDED') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own administrator account.'
      })
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const targetUser = await tx.user.findUnique({
          where: { id: targetUserId },
          select: {
            id: true,
            email: true,
            role: true,
            status: true
          }
        })

        if (!targetUser) return null

        if (targetUser.status === 'DELETED') {
          throw new Error('DELETED_ACCOUNT')
        }

        if (targetUser.status === status) {
          return { user: targetUser, changed: false }
        }

        if (
          targetUser.role === 'ADMIN' &&
          targetUser.status === 'ACTIVE' &&
          status === 'SUSPENDED'
        ) {
          const activeAdminCount = await tx.user.count({
            where: {
              role: 'ADMIN',
              status: 'ACTIVE'
            }
          })

          if (activeAdminCount <= 1) {
            throw new Error('LAST_ACTIVE_ADMIN')
          }
        }

        const previousStatus = targetUser.status

        const user = await tx.user.update({
          where: { id: targetUserId },
          data: { status },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true
              }
            }
          }
        })

        if (status === 'SUSPENDED') {
          await tx.session.deleteMany({
            where: { userId: targetUserId }
          })
        }

        await tx.auditLog.create({
          data: {
            actorId: req.user.id,
            action: status === 'SUSPENDED'
              ? 'USER_SUSPENDED'
              : 'USER_REACTIVATED',
            entityType: 'USER',
            entityId: targetUserId,
            details: {
              email: targetUser.email,
              previousStatus,
              newStatus: status
            },
            ipAddress: req.ip || null
          }
        })

        return { user, changed: true }
      },
      { isolationLevel: 'Serializable' }
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    return res.status(200).json({
      success: true,
      message: result.changed
        ? `User account ${status.toLowerCase()} successfully.`
        : `User account is already ${status.toLowerCase()}.`,
      user: result.user
    })

  } catch (error) {
    if (error.message === 'LAST_ACTIVE_ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend the last active administrator.'
      })
    }

    if (error.message === 'DELETED_ACCOUNT') {
      return res.status(400).json({
        success: false,
        message: 'Deleted accounts cannot be reactivated or suspended.'
      })
    }

    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Another account update is in progress. Please try again.'
      })
    }

    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      })
    }

    console.error('Admin user status update error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update user account status.'
    })
  }
})

// -------------------------
// GET ALL STUDY GROUPS
// -------------------------

router.get('/groups', requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const format = String(req.query.format || '').trim().toUpperCase()
    const status = String(req.query.status || '').trim().toUpperCase()

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    )

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    )

    if (format && !['ONLINE', 'IN_PERSON', 'HYBRID'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group format.'
      })
    }

    if (
      status &&
      !['ACTIVE', 'ARCHIVED', 'SUSPENDED'].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group status.'
      })
    }

    const where = {
      ...(format && { format }),
      ...(status && { status }),
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            courseCode: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            subject: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      })
    }

    const [groups, total] = await prisma.$transaction([
      prisma.studyGroup.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true
                }
              }
            }
          },
          _count: {
            select: {
              memberships: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      prisma.studyGroup.count({ where })
    ])

    return res.status(200).json({
      success: true,
      message: 'Study groups retrieved successfully.',
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin groups retrieval error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve study groups.'
    })
  }
})

// -------------------------
// ARCHIVE STUDY GROUP
// -------------------------

router.patch('/groups/:id/archive', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validation = groupIdSchema.safeParse(req.params.id)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.'
      })
    }

    const groupId = validation.data

    const result = await prisma.$transaction(
      async (tx) => {
        const group = await tx.studyGroup.findUnique({
          where: { id: groupId },
          select: {
            id: true,
            name: true,
            courseCode: true,
            status: true
          }
        })

        if (!group) return null

        if (group.status !== 'ACTIVE') {
          return { conflict: true }
        }

        const updatedGroup = await tx.studyGroup.update({
          where: { id: groupId },
          data: { status: 'ARCHIVED' }
        })

        await tx.auditLog.create({
          data: {
            actorId: req.user.id,
            action: 'GROUP_ARCHIVED',
            entityType: 'STUDY_GROUP',
            entityId: groupId,
            details: {
              groupName: group.name,
              courseCode: group.courseCode,
              previousStatus: 'ACTIVE',
              newStatus: 'ARCHIVED'
            },
            ipAddress: req.ip || null
          }
        })

        return {
          conflict: false,
          group: updatedGroup
        }
      },
      { isolationLevel: 'Serializable' }
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.'
      })
    }

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: 'Only active study groups can be archived.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Study group archived successfully.',
      group: result.group
    })

  } catch (error) {
    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Another group update is in progress. Please try again.'
      })
    }

    console.error('Archive group error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to archive study group.'
    })
  }
})

// -------------------------
// RESTORE ARCHIVED STUDY GROUP
// -------------------------

router.patch('/groups/:id/restore', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validation = groupIdSchema.safeParse(req.params.id)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.'
      })
    }

    const groupId = validation.data

    const result = await prisma.$transaction(
      async (tx) => {
        const group = await tx.studyGroup.findUnique({
          where: { id: groupId },
          select: {
            id: true,
            name: true,
            courseCode: true,
            status: true
          }
        })

        if (!group) return null

        if (group.status !== 'ARCHIVED') {
          return { conflict: true }
        }

        const updatedGroup = await tx.studyGroup.update({
          where: { id: groupId },
          data: { status: 'ACTIVE' }
        })

        await tx.auditLog.create({
          data: {
            actorId: req.user.id,
            action: 'GROUP_RESTORED',
            entityType: 'STUDY_GROUP',
            entityId: groupId,
            details: {
              groupName: group.name,
              courseCode: group.courseCode,
              previousStatus: 'ARCHIVED',
              newStatus: 'ACTIVE'
            },
            ipAddress: req.ip || null
          }
        })

        return {
          conflict: false,
          group: updatedGroup
        }
      },
      { isolationLevel: 'Serializable' }
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.'
      })
    }

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: 'Only archived study groups can be restored.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Study group restored successfully.',
      group: result.group
    })

  } catch (error) {
    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Another group update is in progress. Please try again.'
      })
    }

    console.error('Restore group error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to restore study group.'
    })
  }
})

// -------------------------
// GET ALL DISCUSSION POSTS
// -------------------------

router.get('/discussions', requireAuth, requireAdmin, async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const status = String(req.query.status || 'ALL').trim().toUpperCase()

    const page = Math.max(
      1,
      Number.parseInt(req.query.page, 10) || 1
    )

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    )

    if (!['ALL', 'ACTIVE', 'DELETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion status.'
      })
    }

    const where = {
      ...(status === 'ACTIVE' && { deletedAt: null }),
      ...(status === 'DELETED' && { deletedAt: { not: null } }),

      ...(search && {
        OR: [
          {
            content: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            author: {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            author: {
              profile: {
                is: {
                  username: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              }
            }
          },
          {
            group: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            group: {
              courseCode: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ]
      })
    }

    const [posts, total] = await prisma.$transaction([
      prisma.discussionPost.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatarUrl: true
                }
              }
            }
          },
          group: {
            select: {
              id: true,
              name: true,
              courseCode: true
            }
          },
          deletedBy: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true
                }
              }
            }
          },
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),

      prisma.discussionPost.count({ where })
    ])

    return res.status(200).json({
      success: true,
      message: 'Discussion posts retrieved successfully.',
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Admin discussions retrieval error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve discussion posts.'
    })
  }
})

// -------------------------
// SOFT-DELETE DISCUSSION POST
// -------------------------

router.patch('/discussions/:id/delete', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validation = postIdSchema.safeParse(req.params.id)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion post ID.'
      })
    }

    const postId = validation.data

    const result = await prisma.$transaction(
      async (tx) => {
        const post = await tx.discussionPost.findUnique({
          where: { id: postId },
          select: {
            id: true,
            deletedAt: true,
            authorId: true,
            group: {
              select: {
                id: true,
                name: true,
                courseCode: true
              }
            }
          }
        })

        if (!post) return null

        if (post.deletedAt) {
          return { conflict: true }
        }

        const updatedPost = await tx.discussionPost.update({
          where: { id: postId },
          data: {
            deletedAt: new Date(),
            deletedById: req.user.id,
            deletedReason: 'Removed by administrator.'
          }
        })

        await tx.auditLog.create({
          data: {
            actorId: req.user.id,
            action: 'POST_SOFT_DELETED',
            entityType: 'DISCUSSION_POST',
            entityId: postId,
            details: {
              authorId: post.authorId,
              groupId: post.group.id,
              groupName: post.group.name,
              courseCode: post.group.courseCode,
              reason: 'Removed by administrator.'
            },
            ipAddress: req.ip || null
          }
        })

        return {
          conflict: false,
          post: updatedPost
        }
      },
      { isolationLevel: 'Serializable' }
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.'
      })
    }

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: 'This discussion post has already been deleted.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Discussion post deleted successfully.',
      post: result.post
    })

  } catch (error) {
    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Another moderation action is in progress. Please try again.'
      })
    }

    console.error('Admin discussion deletion error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete discussion post.'
    })
  }
})

// -------------------------
// RESTORE DELETED DISCUSSION POST
// -------------------------

router.patch('/discussions/:id/restore', requireAuth, requireAdmin, async (req, res) => {
  try {
    const validation = postIdSchema.safeParse(req.params.id)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion post ID.'
      })
    }

    const postId = validation.data

    const result = await prisma.$transaction(
      async (tx) => {
        const post = await tx.discussionPost.findUnique({
          where: { id: postId },
          select: {
            id: true,
            deletedAt: true,
            authorId: true,
            group: {
              select: {
                id: true,
                name: true,
                courseCode: true
              }
            }
          }
        })

        if (!post) return null

        if (!post.deletedAt) {
          return { conflict: true }
        }

        const updatedPost = await tx.discussionPost.update({
          where: { id: postId },
          data: {
            deletedAt: null,
            deletedById: null,
            deletedReason: null
          }
        })

        await tx.auditLog.create({
          data: {
            actorId: req.user.id,
            action: 'POST_RESTORED',
            entityType: 'DISCUSSION_POST',
            entityId: postId,
            details: {
              authorId: post.authorId,
              groupId: post.group.id,
              groupName: post.group.name,
              courseCode: post.group.courseCode
            },
            ipAddress: req.ip || null
          }
        })

        return {
          conflict: false,
          post: updatedPost
        }
      },
      { isolationLevel: 'Serializable' }
    )

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.'
      })
    }

    if (result.conflict) {
      return res.status(409).json({
        success: false,
        message: 'This discussion post is not deleted.'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Discussion post restored successfully.',
      post: result.post
    })

  } catch (error) {
    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Another moderation action is in progress. Please try again.'
      })
    }

    console.error('Admin discussion restoration error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to restore discussion post.'
    })
  }
})

export default router
