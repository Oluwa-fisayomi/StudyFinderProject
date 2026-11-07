
import prisma from '../lib/prisma.js'

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000

let cleanupInProgress = false

async function deleteExpiredSessions() {
  if (cleanupInProgress) return

  cleanupInProgress = true

  try {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    if (result.count > 0) {
      console.log(
        `[Session cleanup] Removed ${result.count} expired session(s).`
      )
    }
  } catch (error) {
    console.error('[Session cleanup] Failed:', error)
  } finally {
    cleanupInProgress = false
  }
}

export function startSessionCleanup() {
  // Run once immediately when the backend starts.
  void deleteExpiredSessions()

  // Repeat every hour.
  const cleanupTimer = setInterval(() => {
    void deleteExpiredSessions()
  }, CLEANUP_INTERVAL_MS)

  // Allow Node.js to exit naturally if this is the only remaining timer.
  cleanupTimer.unref?.()

  console.log('[Session cleanup] Scheduled to run every hour.')

  // Return a function that stops the scheduled cleanup.
  return () => {
    clearInterval(cleanupTimer)
    console.log('[Session cleanup] Scheduler stopped.')
  }
}
