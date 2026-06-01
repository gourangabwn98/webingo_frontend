import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProjectApi, updateProjectApi, getActivityApi, removeMemberApi } from '../../features/projects/projectsApi'
import { getTasksApi, createTaskApi, bulkUpdateApi, bulkDeleteApi } from '../../features/tasks/tasksApi'
import { setCurrentProject } from '../../features/projects/projectsSlice'
import {
  setTasks, addTask, setFilters, clearSelected, selectAll,
  selectTasks, selectSelected, selectFilters
} from '../../features/tasks/tasksSlice'
import { joinProject, leaveProject } from '../../hooks/useSocket'
import TaskBoard from '../../components/tasks/TaskBoard'
import TaskCard from '../../components/tasks/TaskCard'
import TaskFilters from '../../components/tasks/TaskFilters'
import TaskForm from '../../components/tasks/TaskForm'
import InviteMemberModal from '../../components/projects/InviteMemberModal'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import { PROJECT_ROLES } from '../../utils/constants'
import { selectUser } from '../../features/auth/authSlice'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

// ─── helper: safely compare any two mongo IDs ───────────────────────────────
const sameId = (a, b) => {
  if (!a || !b) return false
  return a.toString() === b.toString()
}

export default function ProjectDetailPage() {
  const { id }    = useParams()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const tasks     = useSelector(selectTasks)
  const selected  = useSelector(selectSelected)
  const filters   = useSelector(selectFilters)
  const user      = useSelector(selectUser)

  const [project,     setProject]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [taskLoading, setTaskLoading] = useState(true)
  const [view,        setView]        = useState('board')
  const [showTask,    setShowTask]    = useState(false)
  const [showInvite,  setShowInvite]  = useState(false)
  const [creating,    setCreating]    = useState(false)
  const [activity,    setActivity]    = useState([])
  const [tab,         setTab]         = useState('tasks')

  // ── derived: who am I in this project? ────────────────────────────────────
  const myMembership = project?.members?.find(
    (m) => sameId(m.user?._id ?? m.user, user?._id)
  )
  const myRole  = myMembership?.role
  const isAdmin =
    myRole === 'project_admin' ||
    sameId(project?.owner?._id ?? project?.owner, user?._id)

  // ── data loading ──────────────────────────────────────────────────────────
  useEffect(() => {
    joinProject(id)
    loadProject()
    loadTasks()
    return () => leaveProject(id)
  }, [id])

  // reload tasks whenever filters change
  useEffect(() => {
    if (project) loadTasks()
  }, [filters])

  const loadProject = async () => {
    try {
      const res = await getProjectApi(id)
      const proj = res.data.data.project
      setProject(proj)
      dispatch(setCurrentProject(proj))
    } catch {
      toast.error('Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    setTaskLoading(true)
    try {
      const params = {
        sortBy:    filters.sortBy    || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
      }
      if (filters.status)   params.status   = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.search)   params.search   = filters.search

      const res = await getTasksApi(id, params)
      dispatch(setTasks(res.data.data))
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setTaskLoading(false)
    }
  }

  const loadActivity = async () => {
    try {
      const res = await getActivityApi(id)
      setActivity(res.data.data.logs)
    } catch {
      toast.error('Failed to load activity')
    }
  }

  // ── task actions ──────────────────────────────────────────────────────────
  const handleCreateTask = async (data) => {
    setCreating(true)
    try {
      const res = await createTaskApi(id, data)
      dispatch(addTask(res.data.data.task))
      toast.success('Task created!')
      setShowTask(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const handleBulkUpdate = async (update) => {
    try {
      await bulkUpdateApi(id, { taskIds: selected, update })
      dispatch(clearSelected())
      loadTasks()
      toast.success('Tasks updated')
    } catch {
      toast.error('Bulk update failed')
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} task(s)?`)) return
    try {
      await bulkDeleteApi(id, { taskIds: selected })
      dispatch(clearSelected())
      loadTasks()
      toast.success('Tasks deleted')
    } catch {
      toast.error('Bulk delete failed')
    }
  }

  // ── member actions ────────────────────────────────────────────────────────
  const handleRemoveMember = async (memberId) => {
    if (!confirm('Remove this member from the project?')) return
    try {
      await removeMemberApi(id, memberId)
      await loadProject()
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  // ── loading state ─────────────────────────────────────────────────────────
  if (loading) return (
    <div className="space-y-4">
      <div style={{ height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8, width: '33%' }} className="animate-pulse" />
      <div style={{ height: 16, background: 'rgba(255,255,255,0.05)', borderRadius: 8, width: '50%' }} className="animate-pulse" />
    </div>
  )

  if (!project) return (
    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
      <p style={{ color: '#94a3b8' }}>Project not found</p>
    </div>
  )

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          {/* breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <button
              onClick={() => navigate('/projects')}
              style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = '#64748b'}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <h1 className="page-title">{project.name}</h1>
            <Badge
              color={project.status === 'active' ? 'text-green-400' : 'text-slate-400'}
              bg={project.status === 'active' ? 'bg-green-400/10' : 'bg-slate-400/10'}
            >
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginLeft: '1.75rem' }}>
              {project.description}
            </p>
          )}
          {/* show current user role */}
          <div style={{ marginLeft: '1.75rem', marginTop: '0.25rem' }}>
            <span style={{
              fontSize: '0.75rem',
              color: '#6366f1',
              background: 'rgba(99,102,241,0.1)',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid rgba(99,102,241,0.2)',
            }}>
              Your role: {myRole ? myRole.replace('_', ' ') : 'loading…'}
            </span>
          </div>
        </div>

        {/* action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              Invite
            </Button>
          )}
          <Button size="sm" onClick={() => setShowTask(true)}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add Task
          </Button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        {['tasks', 'members', 'activity'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'activity') loadActivity() }}
            style={{
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              background: 'none',
              border: 'none',
              borderBottom: tab === t ? '2px solid #6366f1' : '2px solid transparent',
              color: tab === t ? '#818cf8' : '#64748b',
              cursor: 'pointer',
              marginBottom: -1,
              transition: 'color 0.2s',
            }}
          >
            {t}
            {t === 'members' && (
              <span style={{
                marginLeft: '0.375rem',
                fontSize: '0.7rem',
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                padding: '1px 6px',
                borderRadius: '999px',
              }}>
                {project.members?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB: TASKS
      ══════════════════════════════════════════════════════ */}
      {tab === 'tasks' && (
        <div className="space-y-4">

          {/* Filters + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <TaskFilters onFilter={loadTasks} />
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {/* Board view */}
              <button
                onClick={() => setView('board')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: view === 'board' ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: view === 'board' ? '#818cf8' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
              {/* List view */}
              <button
                onClick={() => setView('list')}
                style={{
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  background: view === 'list' ? 'rgba(99,102,241,0.2)' : 'transparent',
                  color: view === 'list' ? '#818cf8' : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Bulk actions bar */}
          {selected.length > 0 && (
            <div className="animate-fade-in" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '0.75rem',
            }}>
              <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                {selected.length} task{selected.length > 1 ? 's' : ''} selected
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <Button size="sm" variant="outline"
                  onClick={() => handleBulkUpdate({ status: 'completed' })}>
                  ✅ Mark Completed
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => handleBulkUpdate({ status: 'in_progress' })}>
                  🔄 In Progress
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                    🗑 Delete
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => dispatch(clearSelected())}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Select all row (list view only) */}
          {view === 'list' && tasks.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="select-all"
                onChange={(e) => e.target.checked ? dispatch(selectAll()) : dispatch(clearSelected())}
                checked={selected.length === tasks.length && tasks.length > 0}
                style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <label htmlFor="select-all" style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                Select all ({tasks.length})
              </label>
            </div>
          )}

          {/* Task content */}
          {view === 'board' ? (
            <TaskBoard tasks={tasks} loading={taskLoading} />
          ) : (
            <div className="space-y-2">
              {taskLoading
                ? [1,2,3,4].map((i) => (
                    <div key={i} style={{ height: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 12 }} className="animate-pulse" />
                  ))
                : tasks.length === 0
                  ? (
                    <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                      <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📝</p>
                      <p style={{ color: '#94a3b8' }}>No tasks yet — create your first one!</p>
                    </div>
                  )
                  : tasks.map((t) => <TaskCard key={t._id} task={t} />)
              }
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: MEMBERS
      ══════════════════════════════════════════════════════ */}
      {tab === 'members' && (
        <div className="space-y-3 animate-fade-in">
          {project.members?.map((m) => {
            // user can be populated object OR just an ID string
            const memberUser  = typeof m.user === 'object' ? m.user : { _id: m.user, name: 'Unknown' }
            const memberId    = memberUser._id?.toString()
            const roleConfig  = PROJECT_ROLES[m.role] || {}
            const isSelf      = sameId(memberId, user?._id)

            return (
              <div key={memberId} className="card" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem 1.25rem',
              }}>
                <Avatar user={memberUser} size="md" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <p style={{ fontWeight: 500, color: '#e2e8f0', fontSize: '0.95rem' }}>
                      {memberUser.name}
                    </p>
                    {isSelf && (
                      <span style={{
                        fontSize: '0.7rem',
                        color: '#6366f1',
                        background: 'rgba(99,102,241,0.15)',
                        padding: '1px 6px',
                        borderRadius: '999px',
                      }}>You</span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{memberUser.email}</p>
                </div>
                <Badge color={roleConfig.color} bg={roleConfig.bg}>
                  {roleConfig.label || m.role}
                </Badge>
                {isAdmin && !isSelf && (
                  <button
                    onClick={() => handleRemoveMember(memberId)}
                    title="Remove member"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#475569',
                      padding: '0.25rem',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = 'none' }}
                  >
                    <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"/>
                    </svg>
                  </button>
                )}
              </div>
            )
          })}

          {isAdmin && (
            <button
              onClick={() => setShowInvite(true)}
              style={{
                width: '100%',
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: '2px dashed rgba(99,102,241,0.3)',
                background: 'transparent',
                color: '#6366f1',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)' }}
            >
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
              </svg>
              Invite New Member
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB: ACTIVITY
      ══════════════════════════════════════════════════════ */}
      {tab === 'activity' && (
        <div className="space-y-3 animate-fade-in">
          {activity.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📋</p>
              <p>No activity yet</p>
            </div>
          ) : (
            activity.map((log) => (
              <div key={log._id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '0.875rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.75rem',
              }}>
                <Avatar user={log.user} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{log.user?.name} </span>
                    <span style={{ color: '#94a3b8' }}>{log.action?.replace(/_/g, ' ')}</span>
                    {log.meta?.title && (
                      <span style={{ color: '#818cf8' }}> "{log.meta.title}"</span>
                    )}
                    {log.meta?.name && (
                      <span style={{ color: '#818cf8' }}> "{log.meta.name}"</span>
                    )}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.25rem' }}>
                    {timeAgo(log.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <Modal open={showTask} onClose={() => setShowTask(false)} title="Create Task" size="lg">
        <TaskForm
          onSubmit={handleCreateTask}
          loading={creating}
          members={project?.members || []}
        />
      </Modal>

      <InviteMemberModal
        open={showInvite}
        onClose={() => { setShowInvite(false); loadProject() }}
        projectId={id}
      />
    </div>
  )
}