
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import apiRequest from '../services/api'
import { useAuth } from './AuthContext'

const GroupContext = createContext(null)

function normalizePost(post) {
  const authorName = [
    post.author?.profile?.firstName,
    post.author?.profile?.lastName,
  ]
    .filter(Boolean)
    .join(' ') || post.author?.profile?.username || 'Unknown user'

  return {
    ...post,
    author: authorName,
    authorName,
    authorDetails: post.author,
    commentsCount: post._count?.comments ?? 0,
  }
}

function normalizeGroup(group, membership = null) {
  const memberCount = group._count?.memberships ?? 0
  const membershipStatus = membership?.membershipStatus ?? null

  return {
    ...group,
    members: memberCount,
    capacity: group.capacity,
    isJoined:
      membershipStatus === 'ACTIVE' ||
      membershipStatus === 'PENDING',
    membershipStatus,
    posts: [],
  }
}

export function GroupProvider({ children }) {
  const { user, loading: authLoading } = useAuth()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const requestIdRef = useRef(0)

  const refreshGroups = useCallback(async () => {
    if (!user) {
      requestIdRef.current += 1
      setGroups([])
      setError('')
      return
    }

    const requestId = ++requestIdRef.current

    try {
      setError('')

      const [discoverResponse, myGroupsResponse] = await Promise.all([
        apiRequest('/groups'),
        apiRequest('/groups/my-groups'),
      ])

      if (
        !Array.isArray(discoverResponse.groups) ||
        !Array.isArray(myGroupsResponse.groups)
      ) {
        throw new Error('Unable to load study groups.')
      }

      const combinedGroups = new Map()

      // Add publicly discoverable groups.
      discoverResponse.groups.forEach((group) => {
        combinedGroups.set(group.id, {
          group,
          membership: null,
        })
      })

      // Include the user's memberships, including private groups.
      myGroupsResponse.groups.forEach((item) => {
        combinedGroups.set(item.group.id, {
          group: item.group,
          membership: item,
        })
      })

      const normalizedGroups = Array.from(
        combinedGroups.values()
      ).map(({ group, membership }) =>
        normalizeGroup(group, membership)
      )

      // Load discussion posts for active members.
      const groupsWithPosts = await Promise.all(
        normalizedGroups.map(async (group) => {
          if (group.membershipStatus !== 'ACTIVE') {
            return group
          }

          try {
            const response = await apiRequest(
              `/groups/${group.id}/posts`
            )

            return {
              ...group,
              posts: Array.isArray(response.posts)
                ? response.posts.map(normalizePost)
                : [],
            }
          } catch {
            return group
          }
        })
      )

      // Ignore results from older requests.
      if (requestId !== requestIdRef.current) {
        return
      }

      setGroups(groupsWithPosts)
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message || 'Unable to load study groups.')
      }

      throw err
    }
  }, [user])

  // Load groups only after authentication has finished.
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!user) {
      requestIdRef.current += 1
      setGroups([])
      setError('')
      setLoading(false)
      return
    }

    let cancelled = false

    async function loadGroups() {
      setLoading(true)

      try {
        await refreshGroups()
      } catch {
        // The error is already stored in state.
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadGroups()

    return () => {
      cancelled = true
    }
  }, [user, authLoading, refreshGroups])

  async function addGroup(groupDetails) {
    const response = await apiRequest('/groups', {
      method: 'POST',
      body: JSON.stringify(groupDetails),
    })

    await refreshGroups()

    return response
  }

  async function joinGroup(groupId) {
    const response = await apiRequest(
      `/groups/${groupId}/join`,
      {
        method: 'POST',
      }
    )

    await refreshGroups()

    return response
  }

  async function leaveGroup(groupId) {
    const response = await apiRequest(
      `/groups/${groupId}/leave`,
      {
        method: 'POST',
      }
    )

    await refreshGroups()

    return response
  }

  async function addPost(groupId, content) {
    const response = await apiRequest(
      `/groups/${groupId}/posts`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    )

    const newPost = normalizePost(response.post)

    setGroups((previousGroups) =>
      previousGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              posts: [...(group.posts || []), newPost],
            }
          : group
      )
    )

    return response
  }

  // Update the local group cache after a post is deleted.
  function deletePost(groupId, postId) {
    setGroups((previousGroups) =>
      previousGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              posts: (group.posts || []).filter(
                (post) => post.id !== postId
              ),
            }
          : group
      )
    )
  }

  return (
    <GroupContext.Provider
      value={{
        groups,
        loading: loading || authLoading,
        error,
        refreshGroups,
        addGroup,
        joinGroup,
        leaveGroup,
        addPost,
        deletePost,
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupContext)

  if (!context) {
    throw new Error('useGroups must be used inside a GroupProvider.')
  }

  return context
}
