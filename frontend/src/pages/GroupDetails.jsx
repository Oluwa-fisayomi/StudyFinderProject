
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Users,
  CalendarDays,
  Clock,
  MessageSquare,
  Send,
  BookOpen,
  CheckCircle2,
  UserRound,
  Info,
  ChevronDown,
  ChevronUp,
  Pencil,
  X,
  Save,
  Trash2,
  Crown,
  RefreshCw,
} from 'lucide-react'
import { useGroups } from '../context/GroupContext'
import { useAuth } from '../context/AuthContext'
import apiRequest from '../services/api'

function GroupDetails() {
  const { id } = useParams()
  const {
    groups,
    joinGroup,
    leaveGroup,
    addPost,
    deletePost: removeLocalPost,
    refreshGroups,
  } = useGroups()
  const { user } = useAuth()

  const contextGroup = groups.find((item) => String(item.id) === id)

  const [groupDetails, setGroupDetails] = useState(null)
  const [loadingGroupDetails, setLoadingGroupDetails] = useState(true)
  const [groupDetailsError, setGroupDetailsError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const [postContent, setPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')

  const [commentsByPost, setCommentsByPost] = useState({})
  const [expandedPosts, setExpandedPosts] = useState({})
  const [commentInputs, setCommentInputs] = useState({})
  const [loadingComments, setLoadingComments] = useState({})
  const [submittingComments, setSubmittingComments] = useState({})
  const [commentErrors, setCommentErrors] = useState({})

  const [editingPostId, setEditingPostId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editedPosts, setEditedPosts] = useState({})
  const [deletingPostId, setDeletingPostId] = useState(null)
  const [deleteError, setDeleteError] = useState('')

  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [savingCommentEdit, setSavingCommentEdit] = useState(false)
  const [commentEditError, setCommentEditError] = useState('')
  const [deletingCommentId, setDeletingCommentId] = useState(null)

  const [selectedNewOwner, setSelectedNewOwner] = useState('')
  const [transferringOwnership, setTransferringOwnership] = useState(false)
  const [ownershipError, setOwnershipError] = useState('')
  const [ownershipSuccess, setOwnershipSuccess] = useState('')

  const [membershipAction, setMembershipAction] = useState(false)
  const [membershipError, setMembershipError] = useState('')

  const fetchGroupDetails = useCallback(async () => {
    if (!id) return

    setLoadingGroupDetails(true)
    setGroupDetailsError('')

    try {
      const data = await apiRequest(`/groups/${id}`)
      setGroupDetails(data.group || data)
    } catch (error) {
      setGroupDetailsError(
        error.message || 'Unable to load group details.'
      )
    } finally {
      setLoadingGroupDetails(false)
    }
  }, [id])

  useEffect(() => {
    fetchGroupDetails()
  }, [fetchGroupDetails])

  const group = useMemo(() => {
    if (!groupDetails && !contextGroup) return null

    // The API response supplies complete group and membership details.
    // Context supplies discussion posts and the latest membership state.
    return {
      ...(contextGroup || {}),
      ...(groupDetails || {}),
      posts: contextGroup?.posts || [],
      isJoined: contextGroup?.isJoined ?? false,
      members:
        groupDetails?._count?.memberships ??
        groupDetails?.members ??
        contextGroup?.members ??
        0,
    }
  }, [groupDetails, contextGroup])

  const memberships = useMemo(() => {
    return (group?.memberships || []).filter((membership) => {
      const status = membership.status ?? membership.membershipStatus
      return !status || status === 'ACTIVE'
    })
  }, [group])

  const currentMembership = memberships.find(
    (membership) =>
      (membership.user?.id || membership.userId) === user?.id
  )

  const currentGroupRole =
    currentMembership?.role ||
    contextGroup?.currentUserRole ||
    contextGroup?.membershipRole

  const currentMembershipStatus =
    currentMembership?.status ??
    currentMembership?.membershipStatus ??
    contextGroup?.membershipStatus

  const isActiveMember =
    currentMembershipStatus === 'ACTIVE' ||
    (contextGroup?.isJoined &&
      currentMembershipStatus !== 'PENDING')

  const isJoined =
    currentMembershipStatus === 'ACTIVE' ||
    currentMembershipStatus === 'PENDING' ||
    contextGroup?.isJoined === true

  const isPlatformModerator = ['MODERATOR', 'ADMIN'].includes(user?.role)

  const isGroupModerator = ['OWNER', 'MODERATOR'].includes(
    currentGroupRole
  )

  const eligibleNewOwners = memberships.filter((membership) => {
    const status = membership.status ?? membership.membershipStatus

    return (
      status === 'ACTIVE' &&
      membership.role !== 'OWNER' &&
      membership.user?.id
    )
  })

  const membersList = memberships.map((membership) => {
    const profile = membership.user?.profile
    const fullName =
      `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim()

    return {
      id: membership.user?.id || membership.id,
      name:
        fullName ||
        profile?.username ||
        membership.user?.email ||
        'Group member',
      role: membership.role,
      avatarUrl: profile?.avatarUrl,
    }
  })

  const posts = group?.posts || []
  const capacity = Number(group?.capacity) || 0
  const memberCount = Number(group?.members) || 0
  const hasCapacity = capacity > 0
  const isFull = hasCapacity && memberCount >= capacity
  const capacityPercentage = hasCapacity
    ? Math.min(100, (memberCount / capacity) * 100)
    : 0

  async function retryLoading() {
    setRefreshing(true)
    await Promise.all([
      fetchGroupDetails(),
      refreshGroups().catch(() => {}),
    ])
    setRefreshing(false)
  }

  async function handleMembershipAction(action) {
    if (membershipAction) return

    setMembershipAction(true)
    setMembershipError('')

    try {
      if (action === 'join') {
        await joinGroup(group.id)
      } else {
        await leaveGroup(group.id)
      }

      await fetchGroupDetails()
    } catch (error) {
      setMembershipError(
        error.message ||
          (action === 'join'
            ? 'Unable to join this group.'
            : 'Unable to leave this group.')
      )
    } finally {
      setMembershipAction(false)
    }
  }

  async function handleTransferOwnership() {
    if (!selectedNewOwner || transferringOwnership) return

    const selectedMember = eligibleNewOwners.find(
      (membership) => membership.user?.id === selectedNewOwner
    )

    if (!selectedMember) {
      setOwnershipError('Please select an active group member.')
      return
    }

    const profile = selectedMember.user?.profile
    const memberName =
      `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
      profile?.username ||
      selectedMember.user?.email ||
      'this member'

    const confirmed = window.confirm(
      `Are you sure you want to transfer ownership of "${group.name}" to ${memberName}? You will become a regular group member.`
    )

    if (!confirmed) return

    setTransferringOwnership(true)
    setOwnershipError('')
    setOwnershipSuccess('')

    try {
      const data = await apiRequest(
        `/groups/${group.id}/transfer-ownership`,
        {
          method: 'POST',
          body: JSON.stringify({ newOwnerId: selectedNewOwner }),
        }
      )

      setOwnershipSuccess(
        data.message || 'Group ownership transferred successfully.'
      )

      await Promise.all([
        fetchGroupDetails(),
        refreshGroups().catch(() => {}),
      ])

      setSelectedNewOwner('')
    } catch (error) {
      setOwnershipError(
        error.message || 'Unable to transfer group ownership.'
      )
    } finally {
      setTransferringOwnership(false)
    }
  }

  async function handlePost(event) {
    event.preventDefault()

    const content = postContent.trim()
    if (!content || posting) return

    if (content.length > 2000) {
      setPostError('Post content cannot exceed 2000 characters.')
      return
    }

    setPosting(true)
    setPostError('')

    try {
      await addPost(group.id, content)
      setPostContent('')
    } catch (error) {
      setPostError(error.message || 'Unable to create this post.')
    } finally {
      setPosting(false)
    }
  }

  function startEditing(post) {
    setEditingPostId(post.id)
    setEditingContent(post.content)
    setEditError('')
    setDeleteError('')
  }

  function cancelEditing() {
    setEditingPostId(null)
    setEditingContent('')
    setEditError('')
  }

  async function saveEditedPost(event, postId) {
    event.preventDefault()

    const content = editingContent.trim()

    if (!content) {
      setEditError('Post content cannot be empty.')
      return
    }

    if (content.length > 2000) {
      setEditError('Post content cannot exceed 2000 characters.')
      return
    }

    if (savingEdit) return

    setSavingEdit(true)
    setEditError('')

    try {
      const data = await apiRequest(
        `/groups/${group.id}/posts/${postId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ content }),
        }
      )

      setEditedPosts((previous) => ({
        ...previous,
        [postId]: data.post,
      }))

      cancelEditing()
    } catch (error) {
      setEditError(error.message || 'Unable to update this post.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDeletePost(postId) {
    if (deletingPostId) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this post? This action cannot be undone from the discussion.'
    )

    if (!confirmed) return

    setDeletingPostId(postId)
    setDeleteError('')

    try {
      await apiRequest(`/groups/${group.id}/posts/${postId}`, {
        method: 'DELETE',
      })

      removeLocalPost(group.id, postId)

      setEditedPosts((previous) => {
        const updated = { ...previous }
        delete updated[postId]
        return updated
      })

      setCommentsByPost((previous) => {
        const updated = { ...previous }
        delete updated[postId]
        return updated
      })

      setExpandedPosts((previous) => {
        const updated = { ...previous }
        delete updated[postId]
        return updated
      })

      if (editingPostId === postId) cancelEditing()
    } catch (error) {
      setDeleteError(error.message || 'Unable to delete this post.')
    } finally {
      setDeletingPostId(null)
    }
  }

  async function loadComments(postId) {
    setLoadingComments((previous) => ({
      ...previous,
      [postId]: true,
    }))

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }))

    try {
      const data = await apiRequest(
        `/groups/${group.id}/posts/${postId}/comments`
      )

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: data.comments || [],
      }))
    } catch (error) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: error.message || 'Unable to load comments.',
      }))
    } finally {
      setLoadingComments((previous) => ({
        ...previous,
        [postId]: false,
      }))
    }
  }

  async function toggleComments(postId) {
    const isExpanded = expandedPosts[postId]

    setExpandedPosts((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }))

    if (!isExpanded && !commentsByPost[postId]) {
      await loadComments(postId)
    }
  }

  async function handleComment(event, postId) {
    event.preventDefault()

    const content = (commentInputs[postId] || '').trim()

    if (!content || submittingComments[postId]) return

    if (content.length > 2000) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: 'Comment cannot exceed 2000 characters.',
      }))
      return
    }

    setSubmittingComments((previous) => ({
      ...previous,
      [postId]: true,
    }))

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }))

    try {
      const data = await apiRequest(
        `/groups/${group.id}/posts/${postId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ content }),
        }
      )

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: [...(previous[postId] || []), data.comment],
      }))

      setCommentInputs((previous) => ({
        ...previous,
        [postId]: '',
      }))
    } catch (error) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: error.message || 'Unable to submit comment.',
      }))
    } finally {
      setSubmittingComments((previous) => ({
        ...previous,
        [postId]: false,
      }))
    }
  }

  function startEditingComment(comment) {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
    setCommentEditError('')
  }

  function cancelEditingComment() {
    setEditingCommentId(null)
    setEditingCommentContent('')
    setCommentEditError('')
  }

  async function saveEditedComment(event, postId, commentId) {
    event.preventDefault()

    const content = editingCommentContent.trim()

    if (!content) {
      setCommentEditError('Comment cannot be empty.')
      return
    }

    if (content.length > 2000) {
      setCommentEditError('Comment cannot exceed 2000 characters.')
      return
    }

    if (savingCommentEdit) return

    setSavingCommentEdit(true)
    setCommentEditError('')

    try {
      const data = await apiRequest(
        `/groups/${group.id}/posts/${postId}/comments/${commentId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ content }),
        }
      )

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: (previous[postId] || []).map((comment) =>
          comment.id === commentId ? data.comment : comment
        ),
      }))

      cancelEditingComment()
    } catch (error) {
      setCommentEditError(
        error.message || 'Unable to update this comment.'
      )
    } finally {
      setSavingCommentEdit(false)
    }
  }

  async function deleteComment(postId, commentId) {
    if (deletingCommentId) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this comment? This action cannot be undone.'
    )

    if (!confirmed) return

    setDeletingCommentId(commentId)

    setCommentErrors((previous) => ({
      ...previous,
      [postId]: '',
    }))

    try {
      await apiRequest(
        `/groups/${group.id}/posts/${postId}/comments/${commentId}`,
        { method: 'DELETE' }
      )

      setCommentsByPost((previous) => ({
        ...previous,
        [postId]: (previous[postId] || []).filter(
          (comment) => comment.id !== commentId
        ),
      }))

      if (editingCommentId === commentId) {
        cancelEditingComment()
      }
    } catch (error) {
      setCommentErrors((previous) => ({
        ...previous,
        [postId]: error.message || 'Unable to delete this comment.',
      }))
    } finally {
      setDeletingCommentId(null)
    }
  }

  if (loadingGroupDetails && !group) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-10 text-center shadow-sm">
        <RefreshCw size={28} className="mx-auto text-[#315C4C] animate-spin" />
        <p className="text-sm text-slate-500 mt-4">
          Loading study group...
        </p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-10 sm:p-14 text-center shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
        <div className="w-16 h-16 rounded-2xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
          <BookOpen size={30} />
        </div>

        <h2 className="text-xl font-bold text-slate-900 mt-5">
          {groupDetailsError ? 'Unable to Load Group' : 'Group Not Found'}
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          {groupDetailsError ||
            'This study group may have been removed or does not exist.'}
        </p>

        <button
          type="button"
          onClick={retryLoading}
          disabled={refreshing}
          className="inline-flex items-center gap-2 mt-6 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          Try Again
        </button>

        <Link
          to="/find-groups"
          className="inline-flex items-center gap-2 mt-6 ml-3 text-[#315C4C] text-sm font-semibold"
        >
          <ArrowLeft size={17} />
          Find Study Groups
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-8">
      <Link
        to="/find-groups"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#315C4C] transition-colors"
      >
        <ArrowLeft size={17} />
        Back to Find Groups
      </Link>

      {/* Group Information */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#183D32] to-[#315C4C] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-[#183D32]/10">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10" />
        <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border border-white/10" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-white/15 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
              {group.courseCode || 'Study Group'}
            </span>

            <span className="bg-white/10 border border-white/15 text-emerald-50 px-3 py-1.5 rounded-full text-xs font-medium">
              {group.format || 'Not specified'}
            </span>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                isFull
                  ? 'bg-white/15 text-white'
                  : 'bg-[#E7EFE9] text-[#183D32]'
              }`}
            >
              {isFull ? 'Group Full' : 'Spaces Available'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mt-6 tracking-tight">
            {group.name}
          </h1>

          <p className="text-emerald-100/80 mt-4 leading-relaxed max-w-2xl text-sm sm:text-base whitespace-pre-wrap">
            {group.description || 'No description provided.'}
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <CalendarDays size={21} className="text-emerald-100 mb-3" />
              <p className="text-xs text-emerald-100/70">Meeting Day</p>
              <p className="font-semibold text-white mt-1">
                {group.meetingDay || 'Not specified'}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <Clock size={21} className="text-emerald-100 mb-3" />
              <p className="text-xs text-emerald-100/70">Meeting Time</p>
              <p className="font-semibold text-white mt-1">
                {group.meetingTime || 'Not specified'}
              </p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <Users size={21} className="text-emerald-100 mb-3" />
              <p className="text-xs text-emerald-100/70">Group Members</p>
              <p className="font-semibold text-white mt-1">
                {memberCount} / {hasCapacity ? capacity : 'Unlimited'}
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between text-xs mb-3">
              <span className="text-emerald-100/80">Group Capacity</span>
              <span className="text-white font-semibold">
                {hasCapacity
                  ? `${Math.max(0, capacity - memberCount)} spots remaining`
                  : 'No member limit'}
              </span>
            </div>

            <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D5E3D6] rounded-full transition-all duration-300"
                style={{ width: `${capacityPercentage}%` }}
              />
            </div>
          </div>

          <div className="mt-7">
            {isJoined ? (
              <button
                type="button"
                onClick={() => handleMembershipAction('leave')}
                disabled={membershipAction}
                className="inline-flex items-center gap-2 bg-white text-[#315C4C] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-[#EDF3EE] transition-colors disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {membershipAction ? 'Please wait...' : 'Joined Group · Leave Group'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleMembershipAction('join')}
                disabled={isFull || membershipAction}
                className="inline-flex items-center gap-2 bg-[#E7EFE9] text-[#183D32] px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white transition-colors disabled:bg-white/30 disabled:text-white/60 disabled:cursor-not-allowed"
              >
                {membershipAction
                  ? 'Please wait...'
                  : isFull
                    ? 'Group Full'
                    : 'Join This Group'}
                {!isFull && !membershipAction && <ArrowRight size={17} />}
              </button>
            )}

            {membershipError && (
              <p className="text-sm text-white bg-red-900/30 border border-white/20 rounded-lg p-3 mt-3">
                {membershipError}
              </p>
            )}

            {currentMembershipStatus === 'PENDING' && (
              <p className="text-sm text-emerald-50 mt-3">
                Your membership request is awaiting approval.
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Members Section */}
        <section className="lg:col-span-1 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)] h-fit">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-[#315C4C]" />
              <h2 className="font-bold text-slate-900">Group Members</h2>
            </div>

            <span className="bg-[#EDF3EE] text-[#315C4C] px-2.5 py-1 rounded-full text-xs font-bold">
              {membersList.length}
            </span>
          </div>

          {loadingGroupDetails ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Loading group members...
            </p>
          ) : groupDetailsError ? (
            <div className="text-center py-6">
              <p className="text-sm text-red-600">{groupDetailsError}</p>
              <button
                type="button"
                onClick={retryLoading}
                disabled={refreshing}
                className="text-sm text-[#315C4C] font-semibold underline mt-2"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {membersList.length > 0 ? (
                membersList.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 p-3 bg-[#F7F9F6] rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#DDE8DE] text-[#315C4C] flex items-center justify-center font-bold shrink-0 overflow-hidden">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {member.role === 'OWNER'
                          ? 'Group owner'
                          : member.role === 'MODERATOR'
                            ? 'Group moderator'
                            : 'Group member'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-7">
                  <UserRound size={27} className="mx-auto text-slate-300" />
                  <p className="text-sm text-slate-500 mt-3">
                    No active members found.
                  </p>
                </div>
              )}
            </div>
          )}

          {currentGroupRole === 'OWNER' && (
            <div className="mt-5 pt-5 border-t border-[#EDF1ED]">
              <div className="flex items-center gap-2 mb-3">
                <Crown size={18} className="text-[#315C4C]" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Transfer Ownership
                </h3>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Choose an active member to become the new group owner.
                You will become a regular member after the transfer.
              </p>

              {loadingGroupDetails ? (
                <p className="text-xs text-slate-500">
                  Loading eligible members...
                </p>
              ) : eligibleNewOwners.length > 0 ? (
                <>
                  <select
                    value={selectedNewOwner}
                    onChange={(event) => {
                      setSelectedNewOwner(event.target.value)
                      setOwnershipError('')
                    }}
                    disabled={transferringOwnership}
                    className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-3 text-sm text-slate-700 outline-none focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 disabled:opacity-60"
                  >
                    <option value="">Select a new group owner</option>
                    {eligibleNewOwners.map((membership) => {
                      const profile = membership.user?.profile
                      const memberName =
                        `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() ||
                        profile?.username ||
                        membership.user?.email ||
                        'Group member'

                      return (
                        <option
                          key={membership.user.id}
                          value={membership.user.id}
                        >
                          {memberName}
                        </option>
                      )
                    })}
                  </select>

                  {ownershipError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mt-3">
                      {ownershipError}
                    </p>
                  )}

                  {ownershipSuccess && (
                    <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-lg p-3 mt-3">
                      {ownershipSuccess}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleTransferOwnership}
                    disabled={!selectedNewOwner || transferringOwnership}
                    className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-[#183D32] text-white px-4 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <Crown size={16} />
                    {transferringOwnership
                      ? 'Transferring...'
                      : 'Transfer Ownership'}
                  </button>
                </>
              ) : (
                <p className="text-xs text-slate-500 bg-[#F7F9F6] rounded-xl p-3">
                  There are no other active members available to receive ownership.
                </p>
              )}
            </div>
          )}
        </section>

        {/* Discussion Section */}
        <section className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_5px_25px_-18px_rgba(24,61,50,0.25)]">
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center">
                <MessageSquare size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">Group Discussion</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Connect and share ideas.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-[#315C4C] bg-[#EDF3EE] px-3 py-1.5 rounded-full">
              {posts.length} {posts.length === 1 ? 'message' : 'messages'}
            </span>
          </div>

          {isActiveMember ? (
            <form onSubmit={handlePost} className="space-y-3">
              <textarea
                value={postContent}
                onChange={(event) => {
                  setPostContent(event.target.value)
                  setPostError('')
                }}
                placeholder="Share a question, idea or message with your group..."
                rows={4}
                maxLength={2000}
                disabled={posting}
                className="w-full bg-[#F7F9F6] border border-[#E5EBE5] rounded-xl p-4 text-sm text-slate-700 outline-none resize-y focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all disabled:opacity-60"
              />

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-slate-400">
                  Keep your messages helpful and respectful.
                </p>

                <button
                  type="submit"
                  disabled={!postContent.trim() || posting}
                  className="inline-flex items-center gap-2 bg-[#183D32] text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-[#315C4C] transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {posting ? 'Sending...' : 'Send Message'}
                </button>
              </div>

              {postError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {postError}
                </p>
              )}
            </form>
          ) : (
            <div className="bg-[#EDF3EE] border border-[#DCE7DD] rounded-xl p-4 flex gap-3">
              <Info size={20} className="text-[#315C4C] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#183D32]">
                  Join the conversation
                </p>
                <p className="text-sm text-[#315C4C] mt-1">
                  {currentMembershipStatus === 'PENDING'
                    ? 'Your membership request must be approved before you can participate in discussions.'
                    : 'Join this study group to participate in its discussions.'}
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-[#EDF1ED] mt-7 pt-6">
            <h3 className="font-bold text-slate-900 mb-5">
              Recent Messages
            </h3>

            {deleteError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                {deleteError}
              </p>
            )}

            {posts.length > 0 ? (
              <div className="space-y-4">
                {[...posts].reverse().map((originalPost) => {
                  const post =
                    editedPosts[originalPost.id] || originalPost
                  const comments = commentsByPost[post.id] || []

                  const commentCount = commentsByPost[post.id]
                    ? comments.length
                    : post.commentsCount ?? post._count?.comments ?? 0

                  // GroupContext stores the original author object in
                  // authorDetails and the display name in author.
                  const authorDetails =
                    post.authorDetails ||
                    (typeof post.author === 'object'
                      ? post.author
                      : null)

                  const firstName =
                    authorDetails?.profile?.firstName || ''
                  const lastName =
                    authorDetails?.profile?.lastName || ''

                  const authorName =
                    post.authorName ||
                    `${firstName} ${lastName}`.trim() ||
                    authorDetails?.profile?.username ||
                    authorDetails?.email ||
                    (typeof post.author === 'string' ? post.author : '') ||
                    'Group member'

                  const isPostAuthor =
                    user?.id &&
                    (post.authorId === user.id ||
                      authorDetails?.id === user.id)

                  return (
                    <div
                      key={post.id}
                      className="bg-[#F7F9F6] rounded-xl p-4 sm:p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#DDE8DE] text-[#315C4C] flex items-center justify-center shrink-0">
                            <BookOpen size={17} />
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-800">
                              {authorName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {post.createdAt
                                ? new Date(post.createdAt).toLocaleString()
                                : 'Recently'}
                            </p>
                          </div>
                        </div>

                        {isPostAuthor && (
                          <div className="flex items-center gap-2 shrink-0">
                            {editingPostId !== post.id && (
                              <button
                                type="button"
                                onClick={() => startEditing(post)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#315C4C] hover:text-[#183D32] bg-white border border-[#DCE7DD] px-3 py-2 rounded-lg transition-colors"
                              >
                                <Pencil size={14} />
                                Edit
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={
                                deletingPostId === post.id ||
                                editingPostId === post.id
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-white border border-red-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              {deletingPostId === post.id
                                ? 'Deleting...'
                                : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>

                      {editingPostId === post.id ? (
                        <form
                          onSubmit={(event) =>
                            saveEditedPost(event, post.id)
                          }
                          className="mt-4 space-y-3"
                        >
                          <textarea
                            value={editingContent}
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            rows={4}
                            maxLength={2000}
                            autoFocus
                            className="w-full bg-white border border-[#DCE7DD] rounded-xl p-4 text-sm text-slate-700 outline-none resize-y focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20 transition-all"
                          />

                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-xs text-slate-400">
                              {editingContent.length}/2000 characters
                            </p>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={cancelEditing}
                                disabled={savingEdit}
                                className="inline-flex items-center gap-1.5 bg-white border border-[#DCE7DD] text-slate-600 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                              >
                                <X size={15} />
                                Cancel
                              </button>

                              <button
                                type="submit"
                                disabled={!editingContent.trim() || savingEdit}
                                className="inline-flex items-center gap-1.5 bg-[#183D32] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#315C4C] disabled:bg-slate-300"
                              >
                                <Save size={15} />
                                {savingEdit ? 'Saving...' : 'Save Changes'}
                              </button>
                            </div>
                          </div>

                          {editError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                              {editError}
                            </p>
                          )}
                        </form>
                      ) : (
                        <p className="text-sm text-slate-700 mt-4 leading-relaxed whitespace-pre-wrap break-words">
                          {post.content}
                        </p>
                      )}

                      <div className="mt-5 pt-4 border-t border-[#E5EBE5]">
                        <button
                          type="button"
                          onClick={() => toggleComments(post.id)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#315C4C] hover:text-[#183D32]"
                        >
                          <MessageSquare size={16} />
                          {commentCount}{' '}
                          {commentCount === 1 ? 'Comment' : 'Comments'}
                          {expandedPosts[post.id] ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>

                        {expandedPosts[post.id] && (
                          <div className="mt-4 space-y-4">
                            {loadingComments[post.id] && (
                              <p className="text-sm text-slate-500 py-3">
                                Loading comments...
                              </p>
                            )}

                            {commentErrors[post.id] && (
                              <div className="bg-red-50 border border-red-100 text-red-600 rounded-xl p-3 text-sm">
                                {commentErrors[post.id]}
                                <button
                                  type="button"
                                  onClick={() => loadComments(post.id)}
                                  className="block font-semibold underline mt-2"
                                >
                                  Try again
                                </button>
                              </div>
                            )}

                            {!loadingComments[post.id] &&
                              !commentErrors[post.id] && (
                                <div className="space-y-3">
                                  {comments.length > 0 ? (
                                    comments.map((comment) => {
                                      const firstName =
                                        comment.author?.profile?.firstName || ''
                                      const lastName =
                                        comment.author?.profile?.lastName || ''

                                      const commentAuthor =
                                        `${firstName} ${lastName}`.trim() ||
                                        comment.author?.profile?.username ||
                                        comment.author?.email ||
                                        'Group member'

                                      const isCommentAuthor =
                                        user?.id &&
                                        (comment.authorId === user.id ||
                                          comment.author?.id === user.id)

                                      const canDeleteComment =
                                        isCommentAuthor ||
                                        isGroupModerator ||
                                        isPlatformModerator

                                      return (
                                        <div
                                          key={comment.id}
                                          className="bg-white border border-[#E5EBE5] rounded-xl p-3 sm:p-4"
                                        >
                                          <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#DDE8DE] text-[#315C4C] flex items-center justify-center font-bold text-xs shrink-0">
                                              {commentAuthor.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                              <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div>
                                                  <p className="text-sm font-semibold text-slate-800">
                                                    {commentAuthor}
                                                  </p>
                                                  <p className="text-xs text-slate-400 mt-0.5">
                                                    {comment.createdAt
                                                      ? new Date(comment.createdAt).toLocaleString()
                                                      : 'Recently'}
                                                  </p>
                                                </div>

                                                {(isCommentAuthor ||
                                                  canDeleteComment) && (
                                                  <div className="flex items-center gap-2">
                                                    {isCommentAuthor &&
                                                      editingCommentId !== comment.id && (
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            startEditingComment(comment)
                                                          }
                                                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#315C4C] hover:text-[#183D32] px-2 py-1.5 rounded-lg hover:bg-[#EDF3EE]"
                                                        >
                                                          <Pencil size={13} />
                                                          Edit
                                                        </button>
                                                      )}

                                                    {canDeleteComment && (
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          deleteComment(post.id, comment.id)
                                                        }
                                                        disabled={
                                                          deletingCommentId === comment.id ||
                                                          editingCommentId === comment.id
                                                        }
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                                      >
                                                        <Trash2 size={13} />
                                                        {deletingCommentId === comment.id
                                                          ? 'Deleting...'
                                                          : 'Delete'}
                                                      </button>
                                                    )}
                                                  </div>
                                                )}
                                              </div>

                                              {editingCommentId === comment.id ? (
                                                <form
                                                  onSubmit={(event) =>
                                                    saveEditedComment(
                                                      event,
                                                      post.id,
                                                      comment.id
                                                    )
                                                  }
                                                  className="mt-3 space-y-2"
                                                >
                                                  <textarea
                                                    value={editingCommentContent}
                                                    onChange={(event) =>
                                                      setEditingCommentContent(event.target.value)
                                                    }
                                                    rows={3}
                                                    maxLength={2000}
                                                    autoFocus
                                                    className="w-full bg-[#F7F9F6] border border-[#DCE7DD] rounded-xl p-3 text-sm text-slate-700 outline-none resize-y focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20"
                                                  />

                                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <span className="text-xs text-slate-400">
                                                      {editingCommentContent.length}/2000 characters
                                                    </span>

                                                    <div className="flex gap-2">
                                                      <button
                                                        type="button"
                                                        onClick={cancelEditingComment}
                                                        disabled={savingCommentEdit}
                                                        className="inline-flex items-center gap-1 bg-white border border-[#DCE7DD] text-slate-600 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50"
                                                      >
                                                        <X size={13} />
                                                        Cancel
                                                      </button>

                                                      <button
                                                        type="submit"
                                                        disabled={
                                                          !editingCommentContent.trim() ||
                                                          savingCommentEdit
                                                        }
                                                        className="inline-flex items-center gap-1 bg-[#183D32] text-white px-3 py-2 rounded-lg text-xs font-semibold disabled:bg-slate-300"
                                                      >
                                                        <Save size={13} />
                                                        {savingCommentEdit
                                                          ? 'Saving...'
                                                          : 'Save'}
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {commentEditError && (
                                                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                                                      {commentEditError}
                                                    </p>
                                                  )}
                                                </form>
                                              ) : (
                                                <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap break-words">
                                                  {comment.content}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    })
                                  ) : (
                                    <p className="text-sm text-slate-400 py-2">
                                      No comments yet. Start the conversation.
                                    </p>
                                  )}
                                </div>
                              )}

                            {isActiveMember && (
                              <form
                                onSubmit={(event) =>
                                  handleComment(event, post.id)
                                }
                                className="space-y-2 pt-2"
                              >
                                <textarea
                                  value={commentInputs[post.id] || ''}
                                  onChange={(event) => {
                                    setCommentInputs((previous) => ({
                                      ...previous,
                                      [post.id]: event.target.value,
                                    }))
                                    setCommentErrors((previous) => ({
                                      ...previous,
                                      [post.id]: '',
                                    }))
                                  }}
                                  placeholder="Write a comment..."
                                  rows={2}
                                  maxLength={2000}
                                  className="w-full bg-white border border-[#E5EBE5] rounded-xl p-3 text-sm text-slate-700 outline-none resize-y focus:border-[#668B72] focus:ring-4 focus:ring-[#A8B9A8]/20"
                                />

                                <div className="flex justify-end">
                                  <button
                                    type="submit"
                                    disabled={
                                      !commentInputs[post.id]?.trim() ||
                                      submittingComments[post.id]
                                    }
                                    className="inline-flex items-center gap-2 bg-[#183D32] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#315C4C] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                  >
                                    <Send size={15} />
                                    {submittingComments[post.id]
                                      ? 'Sending...'
                                      : 'Send Comment'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-[#EDF3EE] text-[#315C4C] flex items-center justify-center mx-auto">
                  <MessageSquare size={23} />
                </div>

                <p className="font-semibold text-slate-700 mt-4">
                  No messages yet.
                </p>

                <p className="text-sm text-slate-500 mt-2">
                  Start a conversation with your study group.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default GroupDetails
