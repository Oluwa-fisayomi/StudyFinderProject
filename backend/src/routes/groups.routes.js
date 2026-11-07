
import express from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

// -------------------------
// VALIDATION SCHEMAS
// -------------------------

const createGroupSchema = z.object({
  name: z.string().trim().min(3).max(100),
  description: z.string().trim().min(10).max(2000),
  courseCode: z.string().trim().min(2).max(30),
  subject: z.string().trim().max(100).optional(),
  schedule: z.string().trim().max(200).optional(),
  format: z.enum(['ONLINE', 'IN_PERSON', 'HYBRID']).default('ONLINE'),
  meetingLink: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  capacity: z.number().int().min(2).max(500).nullable().optional(),
})

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

const updatePostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

const updateCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
})

// -------------------------
// CREATE A STUDY GROUP
// -------------------------

router.post('/', requireAuth, async (req, res) => {
  try {
    const validation = createGroupSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group information.',
        errors: validation.error.flatten(),
      })
    }

    const data = validation.data

    if (data.format === 'ONLINE' && !data.meetingLink) {
      return res.status(400).json({
        success: false,
        message: 'An online group must have a meeting link.',
      })
    }

    if (data.format === 'IN_PERSON' && !data.location) {
      return res.status(400).json({
        success: false,
        message: 'An in-person group must have a location.',
      })
    }

    if (data.format === 'HYBRID' && (!data.meetingLink || !data.location)) {
      return res.status(400).json({
        success: false,
        message: 'A hybrid group must have both a meeting link and a location.',
      })
    }

    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.studyGroup.create({
        data: {
          ...data,
          creatorId: req.user.id,
        },
      })

      await tx.membership.create({
        data: {
          userId: req.user.id,
          groupId: newGroup.id,
          role: 'OWNER',
          status: 'ACTIVE',
        },
      })

      return newGroup
    })

    return res.status(201).json({
      success: true,
      message: 'Study group created successfully.',
      group,
    })
  } catch (error) {
    console.error('Create group error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create study group.',
    })
  }
})

// -------------------------
// DISCOVER AND SEARCH PUBLIC STUDY GROUPS
// -------------------------

router.get('/', requireAuth, async (req, res) => {
  try {
    const search = String(req.query.search || '').trim()
    const courseCode = String(req.query.courseCode || '').trim()
    const format = String(req.query.format || '').trim().toUpperCase()

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10))

    if (format && !['ONLINE', 'IN_PERSON', 'HYBRID'].includes(format)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group format.',
      })
    }

    const where = {
      status: 'ACTIVE',
      visibility: 'PUBLIC',
      ...(courseCode && {
        courseCode: { contains: courseCode, mode: 'insensitive' },
      }),
      ...(format && { format }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { courseCode: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
        ],
      }),
    }

    const [groups, total] = await prisma.$transaction([
      prisma.studyGroup.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  username: true,
                  avatarUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              memberships: {
                where: { status: 'ACTIVE' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.studyGroup.count({ where }),
    ])

    return res.status(200).json({
      success: true,
      message: 'Study groups retrieved successfully.',
      groups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Discover groups error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve study groups.',
    })
  }
})

// -------------------------
// GET GROUPS BELONGING TO THE LOGGED-IN USER
// IMPORTANT: Keep before /:id
// -------------------------

router.get('/my-groups', requireAuth, async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: {
        userId: req.user.id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
      include: {
        group: {
          include: {
            creator: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            _count: {
              select: {
                memberships: {
                  where: { status: 'ACTIVE' },
                },
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    })

    return res.status(200).json({
      success: true,
      message: 'Your study groups were retrieved successfully.',
      groups: memberships.map((membership) => ({
        membershipId: membership.id,
        role: membership.role,
        membershipStatus: membership.status,
        joinedAt: membership.joinedAt,
        group: membership.group,
      })),
      total: memberships.length,
    })
  } catch (error) {
    console.error('Get my groups error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your study groups.',
    })
  }
})

// -------------------------
// GET STUDY GROUP DETAILS
// -------------------------

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        memberships: {
          where: { status: 'ACTIVE' },
          select: {
            id: true,
            status: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            memberships: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    })

    if (!group || group.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.',
      })
    }

    if (group.visibility === 'PRIVATE') {
      const isMember = group.memberships.some(
        (membership) => membership.user.id === req.user.id
      )

      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this private group.',
        })
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Study group details retrieved successfully.',
      group,
    })
  } catch (error) {
    console.error('Get group details error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve study group details.',
    })
  }
})

// -------------------------
// GET DISCUSSION POSTS
// -------------------------

router.get('/:id/posts', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!group || group.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.',
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to view discussions.',
      })
    }

    const where = { groupId: id, deletedAt: null }

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
                  avatarUrl: true,
                },
              },
            },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.discussionPost.count({ where }),
    ])

    return res.status(200).json({
      success: true,
      message: 'Discussion posts retrieved successfully.',
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get discussion posts error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve discussion posts.',
    })
  }
})

// -------------------------
// CREATE DISCUSSION POST
// -------------------------

router.post('/:id/posts', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    const validation = createPostSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion post content.',
        errors: validation.error.flatten(),
      })
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!group || group.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Study group not found or is not active.',
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to create a discussion post.',
      })
    }

    const post = await prisma.discussionPost.create({
      data: {
        groupId: id,
        authorId: req.user.id,
        content: validation.data.content,
      },
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
                avatarUrl: true,
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    })

    return res.status(201).json({
      success: true,
      message: 'Discussion post created successfully.',
      post,
    })
  } catch (error) {
    console.error('Create discussion post error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create discussion post.',
    })
  }
})

// -------------------------
// EDIT DISCUSSION POST
// -------------------------

router.patch('/:id/posts/:postId', requireAuth, async (req, res) => {
  try {
    const { id, postId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group or discussion post ID.',
      })
    }

    const validation = updatePostSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discussion post content.',
        errors: validation.error.flatten(),
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to edit a discussion post.',
      })
    }

    const post = await prisma.discussionPost.findFirst({
      where: {
        id: postId,
        groupId: id,
        deletedAt: null,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.',
      })
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the author can edit this discussion post.',
      })
    }

    const updatedPost = await prisma.discussionPost.update({
      where: { id: postId },
      data: { content: validation.data.content },
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
                avatarUrl: true,
              },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Discussion post updated successfully.',
      post: updatedPost,
    })
  } catch (error) {
    console.error('Edit discussion post error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to edit discussion post.',
    })
  }
})

// -------------------------
// DELETE DISCUSSION POST
// SOFT DELETION
// -------------------------

router.delete('/:id/posts/:postId', requireAuth, async (req, res) => {
  try {
    const { id, postId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group or discussion post ID.',
      })
    }

    const post = await prisma.discussionPost.findFirst({
      where: {
        id: postId,
        groupId: id,
        deletedAt: null,
      },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.',
      })
    }

    const isPlatformModerator = ['MODERATOR', 'ADMIN'].includes(req.user.role)

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: {
        status: true,
        role: true,
      },
    })

    const isActiveMember = membership?.status === 'ACTIVE'

    if (!isActiveMember && !isPlatformModerator) {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to delete this post.',
      })
    }

    const isAuthor = post.authorId === req.user.id
    const isGroupModerator =
      isActiveMember &&
      ['OWNER', 'MODERATOR'].includes(membership.role)

    if (!isAuthor && !isGroupModerator && !isPlatformModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this discussion post.',
      })
    }

    await prisma.discussionPost.update({
      where: { id: postId },
      data: {
        deletedAt: new Date(),
        deletedById: isAuthor ? null : req.user.id,
        deletedReason: isAuthor ? null : 'Removed by a moderator.',
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Discussion post deleted successfully.',
    })
  } catch (error) {
    console.error('Delete discussion post error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete discussion post.',
    })
  }
})

// -------------------------
// GET DISCUSSION COMMENTS
// -------------------------

router.get('/:id/posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const { id, postId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group or discussion post ID.',
      })
    }

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20))

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!group || group.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.',
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to view comments.',
      })
    }

    const post = await prisma.discussionPost.findFirst({
      where: { id: postId, groupId: id, deletedAt: null },
      select: { id: true },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.',
      })
    }

    const where = { postId }

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
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
                  avatarUrl: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    return res.status(200).json({
      success: true,
      message: 'Discussion comments retrieved successfully.',
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get discussion comments error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve discussion comments.',
    })
  }
})

// -------------------------
// CREATE DISCUSSION COMMENT
// -------------------------

router.post('/:id/posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const { id, postId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group or discussion post ID.',
      })
    }

    const validation = createCommentSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment content.',
        errors: validation.error.flatten(),
      })
    }

    const group = await prisma.studyGroup.findUnique({
      where: { id },
      select: { id: true, status: true },
    })

    if (!group || group.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        message: 'Study group not found.',
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to comment.',
      })
    }

    const post = await prisma.discussionPost.findFirst({
      where: { id: postId, groupId: id, deletedAt: null },
      select: {
        id: true,
        authorId: true,
        content: true,
      },
    })

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Discussion post not found.',
      })
    }

    const comment = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          postId,
          authorId: req.user.id,
          content: validation.data.content,
        },
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
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })

      if (post.authorId !== req.user.id) {
        const commenterName = newComment.author.profile
          ? `${newComment.author.profile.firstName} ${newComment.author.profile.lastName}`.trim()
          : newComment.author.email

        await tx.notification.create({
          data: {
            userId: post.authorId,
            type: 'NEW_COMMENT',
            title: 'New comment on your discussion',
            message: `${commenterName} commented on your discussion post.`,
            link: `/groups/${id}`,
          },
        })
      }

      return newComment
    })

    return res.status(201).json({
      success: true,
      message: 'Comment created successfully.',
      comment,
    })
  } catch (error) {
    console.error('Create discussion comment error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to create discussion comment.',
    })
  }
})

// -------------------------
// EDIT DISCUSSION COMMENT
// AUTHOR ONLY
// -------------------------

router.patch('/:id/posts/:postId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { id, postId, commentId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success ||
      !z.string().uuid().safeParse(commentId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group, post, or comment ID.',
      })
    }

    const validation = updateCommentSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid comment content.',
        errors: validation.error.flatten(),
      })
    }

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: { status: true },
    })

    if (!membership || membership.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to edit a comment.',
      })
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        post: {
          groupId: id,
          deletedAt: null,
        },
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      })
    }

    if (comment.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the comment author can edit this comment.',
      })
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: validation.data.content },
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
                avatarUrl: true,
              },
            },
          },
        },
      },
    })

    return res.status(200).json({
      success: true,
      message: 'Comment updated successfully.',
      comment: updatedComment,
    })
  } catch (error) {
    console.error('Edit discussion comment error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to edit comment.',
    })
  }
})

// -------------------------
// DELETE DISCUSSION COMMENT
// AUTHOR, GROUP MODERATOR OR PLATFORM MODERATOR
// -------------------------

router.delete('/:id/posts/:postId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { id, postId, commentId } = req.params

    if (
      !z.string().uuid().safeParse(id).success ||
      !z.string().uuid().safeParse(postId).success ||
      !z.string().uuid().safeParse(commentId).success
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group, post, or comment ID.',
      })
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        post: {
          groupId: id,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        authorId: true,
      },
    })

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      })
    }

    const isPlatformModerator = ['MODERATOR', 'ADMIN'].includes(req.user.role)

    const membership = await prisma.membership.findUnique({
      where: {
        userId_groupId: {
          userId: req.user.id,
          groupId: id,
        },
      },
      select: {
        status: true,
        role: true,
      },
    })

    const isActiveMember = membership?.status === 'ACTIVE'

    if (!isActiveMember && !isPlatformModerator) {
      return res.status(403).json({
        success: false,
        message: 'You must be an active group member to delete a comment.',
      })
    }

    const isAuthor = comment.authorId === req.user.id
    const isGroupModerator =
      isActiveMember &&
      ['OWNER', 'MODERATOR'].includes(membership.role)

    if (!isAuthor && !isGroupModerator && !isPlatformModerator) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment.',
      })
    }

    await prisma.comment.delete({
      where: { id: commentId },
    })

    return res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    })
  } catch (error) {
    console.error('Delete discussion comment error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to delete comment.',
    })
  }
})

// -------------------------
// JOIN A STUDY GROUP
// SERIALIZABLE TRANSACTION
// -------------------------

router.post('/:id/join', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    let result

    // Retry serialization conflicts up to three attempts.
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        result = await prisma.$transaction(
          async (tx) => {
            const group = await tx.studyGroup.findUnique({
              where: { id },
              include: {
                _count: {
                  select: {
                    memberships: {
                      where: { status: 'ACTIVE' },
                    },
                  },
                },
              },
            })

            if (!group || group.status !== 'ACTIVE') {
              return {
                status: 404,
                message: 'Study group not found.',
              }
            }

            const existingMembership = await tx.membership.findUnique({
              where: {
                userId_groupId: {
                  userId,
                  groupId: id,
                },
              },
            })

            if (existingMembership) {
              if (existingMembership.status === 'ACTIVE') {
                return {
                  status: 409,
                  message: 'You are already a member of this group.',
                }
              }

              if (existingMembership.status === 'PENDING') {
                return {
                  status: 409,
                  message: 'Your membership request is already pending.',
                }
              }

              if (existingMembership.status === 'BANNED') {
                return {
                  status: 403,
                  message: 'You cannot join this group.',
                }
              }

              if (existingMembership.status === 'REJECTED') {
                return {
                  status: 403,
                  message: 'Your previous request was rejected.',
                }
              }

              // Reactivate a previous membership.
              if (existingMembership.status === 'LEFT') {
                if (group.visibility === 'PRIVATE') {
                  return {
                    status: 403,
                    message: 'This is a private group. You need an invitation to join.',
                  }
                }

                if (
                  group.capacity !== null &&
                  group._count.memberships >= group.capacity
                ) {
                  return {
                    status: 409,
                    message: 'This study group has reached its capacity.',
                  }
                }

                const membership = await tx.membership.update({
                  where: {
                    userId_groupId: {
                      userId,
                      groupId: id,
                    },
                  },
                  data: {
                    status: 'ACTIVE',
                    role: 'MEMBER',
                    joinedAt: new Date(),
                  },
                })

                if (group.creatorId !== userId) {
                  const joiningUser = await tx.user.findUnique({
                    where: { id: userId },
                    select: {
                      email: true,
                      profile: {
                        select: {
                          firstName: true,
                          lastName: true,
                        },
                      },
                    },
                  })

                  const joiningName = joiningUser?.profile
                    ? `${joiningUser.profile.firstName} ${joiningUser.profile.lastName}`.trim()
                    : joiningUser?.email || 'A student'

                  await tx.notification.create({
                    data: {
                      userId: group.creatorId,
                      type: 'GROUP_UPDATE',
                      title: 'Previous member rejoined your group',
                      message: `${joiningName} rejoined "${group.name}".`,
                      link: `/groups/${id}`,
                    },
                  })
                }

                return {
                  status: 200,
                  message: 'You have successfully rejoined the study group.',
                  membership,
                }
              }
            }

            if (group.visibility === 'PRIVATE') {
              return {
                status: 403,
                message: 'This is a private group. You need an invitation to join.',
              }
            }

            if (
              group.capacity !== null &&
              group._count.memberships >= group.capacity
            ) {
              return {
                status: 409,
                message: 'This study group has reached its capacity.',
              }
            }

            const membership = await tx.membership.create({
              data: {
                userId,
                groupId: id,
                role: 'MEMBER',
                status: 'ACTIVE',
              },
            })

            if (group.creatorId !== userId) {
              const joiningUser = await tx.user.findUnique({
                where: { id: userId },
                select: {
                  email: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              })

              const joiningName = joiningUser?.profile
                ? `${joiningUser.profile.firstName} ${joiningUser.profile.lastName}`.trim()
                : joiningUser?.email || 'A student'

              await tx.notification.create({
                data: {
                  userId: group.creatorId,
                  type: 'GROUP_UPDATE',
                  title: 'New member joined your group',
                  message: `${joiningName} joined "${group.name}".`,
                  link: `/groups/${id}`,
                },
              })
            }

            return {
              status: 200,
              message: 'You have successfully joined the study group.',
              membership,
            }
          },
          {
            isolationLevel: 'Serializable',
          }
        )

        // Transaction completed successfully.
        break
      } catch (error) {
        // Retry PostgreSQL serialization conflicts.
        if (error.code === 'P2034' && attempt < 3) {
          continue
        }

        throw error
      }
    }

    if (result.status !== 200) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      membership: result.membership,
    })
  } catch (error) {
    console.error('Join group error:', error)

    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'You already have a membership record for this group.',
      })
    }

    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'The group membership changed during your request. Please try again.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to join study group.',
    })
  }
})


 // -------------------------
 // TRANSFER STUDY GROUP OWNERSHIP
 // CURRENT OWNER ONLY
 // -------------------------

const transferOwnershipSchema = z.object({
  newOwnerId: z.string().uuid(),
})

router.post('/:id/transfer-ownership', requireAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    const validation = transferOwnershipSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid new owner ID.',
        errors: validation.error.flatten(),
      })
    }

    const { newOwnerId } = validation.data
    const currentOwnerId = req.user.id

    if (newOwnerId === currentOwnerId) {
      return res.status(400).json({
        success: false,
        message: 'You are already the owner of this group.',
      })
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const group = await tx.studyGroup.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            creatorId: true,
            status: true,
          },
        })

        if (!group || group.status !== 'ACTIVE') {
          return {
            status: 404,
            message: 'Study group not found.',
          }
        }

        const currentOwner = await tx.membership.findUnique({
          where: {
            userId_groupId: {
              userId: currentOwnerId,
              groupId: id,
            },
          },
        })

        if (
          !currentOwner ||
          currentOwner.status !== 'ACTIVE' ||
          currentOwner.role !== 'OWNER'
        ) {
          return {
            status: 403,
            message: 'Only the current group owner can transfer ownership.',
          }
        }

        const newOwner = await tx.membership.findUnique({
          where: {
            userId_groupId: {
              userId: newOwnerId,
              groupId: id,
            },
          },
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        })

        if (!newOwner || newOwner.status !== 'ACTIVE') {
          return {
            status: 400,
            message: 'The selected student must be an active member of this group.',
          }
        }

        if (newOwner.role === 'OWNER') {
          return {
            status: 409,
            message: 'The selected student is already an owner.',
          }
        }

        // Change both membership roles and the group's creator
        // in one transaction.
        await tx.membership.update({
          where: {
            userId_groupId: {
              userId: currentOwnerId,
              groupId: id,
            },
          },
          data: {
            role: 'MEMBER',
          },
        })

        const updatedMembership = await tx.membership.update({
          where: {
            userId_groupId: {
              userId: newOwnerId,
              groupId: id,
            },
          },
          data: {
            role: 'OWNER',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        })

        await tx.studyGroup.update({
          where: { id },
          data: {
            creatorId: newOwnerId,
          },
        })

        const previousOwnerName = req.user.profile
          ? `${req.user.profile.firstName} ${req.user.profile.lastName}`.trim()
          : req.user.email

        const newOwnerName = newOwner.user.profile
          ? `${newOwner.user.profile.firstName} ${newOwner.user.profile.lastName}`.trim()
          : newOwner.user.email

        await tx.notification.createMany({
          data: [
            {
              userId: currentOwnerId,
              type: 'GROUP_UPDATE',
              title: 'Group ownership transferred',
              message: `You transferred ownership of "${group.name}" to ${newOwnerName}.`,
              link: `/groups/${id}`,
            },
            {
              userId: newOwnerId,
              type: 'GROUP_UPDATE',
              title: 'You are the new group owner',
              message: `${previousOwnerName} transferred ownership of "${group.name}" to you.`,
              link: `/groups/${id}`,
            },
          ],
        })

        return {
          status: 200,
          message: 'Group ownership transferred successfully.',
          newOwner: updatedMembership,
        }
      },
      {
        isolationLevel: 'Serializable',
      }
    )

    if (result.status !== 200) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      newOwner: result.newOwner,
    })
  } catch (error) {
    console.error('Transfer group ownership error:', error)

    if (error.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'The group changed during your request. Please try again.',
      })
    }

    return res.status(500).json({
      success: false,
      message: 'Unable to transfer group ownership.',
    })
  }
})


// -------------------------
// LEAVE A STUDY GROUP
// -------------------------

router.post('/:id/leave', requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    if (!z.string().uuid().safeParse(id).success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study group ID.',
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      const group = await tx.studyGroup.findUnique({
        where: { id },
        select: { id: true, status: true },
      })

      if (!group || group.status !== 'ACTIVE') {
        return {
          status: 404,
          message: 'Study group not found.',
        }
      }

      const membership = await tx.membership.findUnique({
        where: {
          userId_groupId: {
            userId,
            groupId: id,
          },
        },
      })

      if (!membership || membership.status !== 'ACTIVE') {
        return {
          status: 404,
          message: 'You are not an active member of this group.',
        }
      }

      if (membership.role === 'OWNER') {
        return {
          status: 403,
          message: 'The group owner cannot leave the group. Transfer ownership or delete the group first.',
        }
      }

      await tx.membership.update({
        where: {
          userId_groupId: {
            userId,
            groupId: id,
          },
        },
        data: { status: 'LEFT' },
      })

      return {
        status: 200,
        message: 'You have successfully left the study group.',
      }
    })

    if (result.status !== 200) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      })
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('Leave group error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to leave study group.',
    })
  }
})

export default router
