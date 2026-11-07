
import express from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = express.Router()

router.use(requireAuth)

// Profile update validation
const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),

  username: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .transform((value) => value.toLowerCase())
    .optional(),

  studentId: z.string().trim().max(50).nullable().optional(),
  institution: z.string().trim().max(150).nullable().optional(),
  department: z.string().trim().max(100).nullable().optional(),
  level: z.string().trim().max(30).nullable().optional(),
  bio: z.string().trim().max(500).nullable().optional(),
  avatarUrl: z.string().trim().max(500).nullable().optional()
}).strict().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Please provide at least one profile field to update.' }
)

// Get the authenticated user's profile
router.get('/', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            studentId: true,
            institution: true,
            department: true,
            level: true,
            bio: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    })

    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile: user.profile
    })

  } catch (error) {
    console.error('Get profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve your profile.'
    })
  }
})

// Update the authenticated user's profile
router.patch('/', async (req, res) => {
  try {
    const validation = profileSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Please check your profile information.',
        errors: validation.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    const data = validation.data

    // Confirm that the profile belongs to the authenticated user
    const existingProfile = await prisma.profile.findUnique({
      where: { userId: req.user.id },
      select: { id: true }
    })

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found. Please contact support.'
      })
    }

    // Check whether the username is already in use
    if (data.username) {
      const usernameOwner = await prisma.profile.findUnique({
        where: { username: data.username },
        select: { userId: true }
      })

      if (usernameOwner && usernameOwner.userId !== req.user.id) {
        return res.status(409).json({
          success: false,
          field: 'username',
          message: 'This username is already taken.'
        })
      }
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user.id },
      data,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        studentId: true,
        institution: true,
        department: true,
        level: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return res.status(200).json({
      success: true,
      message: 'Your profile has been updated successfully.',
      profile: updatedProfile
    })

  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'One of these details is already in use.'
      })
    }

    console.error('Update profile error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to update your profile. Please try again.'
    })
  }
})

export default router
