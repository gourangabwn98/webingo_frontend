import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getProjectApi, updateProjectApi, getActivityApi } from '../../features/projects/projectsApi'
import { getTasksApi, createTaskApi, bulkUpdateApi, bulkDeleteApi } from '../../features/tasks/tasksApi'
import { setCurrentProject } from '../../features/projects/projectsSlice'
import {
  setTasks, addTask, setFilters, clearSelected, selectAll,
  selectTasks, selectSelected, selectFilters
} from '../../features/tasks/tasksSlice'
import { joinProject, leaveProject } from '../../hooks/useSocket'
import { useProjectRole } from '../../hooks/useProjectRole'
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

  // ✅ role-based permissions
  const { isAdmin, canEdit } = useProjectRole(project)

  useEffect(() => {
    joinProject(id)
    loadProject()
    loadTasks()
    return () => leaveProject(id)
  }, [id])

  useEffect(() => { loadTasks() }, [filters])

  const loadProject = async () => {
    try {
      const res = await getProjectApi(id)
      setProject(res.data.data.project)
      dispatch(setCurrentProject(res.data.data.project))
    } finally { setLoading(false) }
  }

  const loadTasks = async () => {
    setTaskLoading(true)
    try {
      const params = {}
      if (filters.status)   params.status    = filters.status
      if (filters.priority) params.priority  = filters.priority
      if (filters.search)   params.search    = filters.search
      params.sortBy    = filters.sortBy
      params.sortOrder = filters.sortOrder
      const res = await getTasksApi(id, params)
      dispatch(setTasks(res.data.data))
    } finally { setTaskLoading(false) }
  }

  const loadActivity = async () => {
    const res = await getActivityApi(id)
    setActivity(res.data.data.logs)
  }

  const handleCreateTask = async (data) => {
    setCreating(true)
    try {
      const res = await createTaskApi(id, data)
      dispatch(addTask(res.data.data.task))
      toast.success('Task created!')
      setShowTask(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed')
    } finally { setCreating(false) }
  }

  const handleBulkUpdate = async (update) => {
    try {
      await bulkUpdateApi(id, { taskIds: selected, update })
      dispatch(clearSelected())
      loadTasks()
      toast.success('Tasks updated')
    } catch { toast.error('Bulk update failed') }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} tasks?`)) return
    try {
      await bulkDeleteApi(id, { taskIds: selected })
      dispatch(clearSelected())
      loadTasks()
      toast.success('Tasks deleted')
    } catch { toast.error('Bulk delete failed') }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-white/5 rounded w-1/3" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
    </div>
  )

  if (!project) return (
    <div className="card text-center py-12">
      <p className="text-slate-400">Project not found</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => navigate('/projects')} className="text-slate-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="page-title">{project.name}</h1>
            <Badge
              color={project.status === 'active' ? 'text-green-400' : 'text-slate-400'}
              bg={project.status === 'active' ? 'bg-green-400/10' : 'bg-slate-400/10'}
            >
              {project.status}
            </Badge>
            {/* ✅ Show viewer badge */}
            {!canEdit && (
              <Badge color="text-yellow-400" bg="bg-yellow-400/10">
                👁 Viewer
              </Badge>
            )}
          </div>
          <p className="text-slate-400 text-sm ml-8">{project.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* ✅ Only admin can invite */}
          {isAdmin && (
            <Button variant="outline" size="sm" onClick={() => setShowInvite(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite
            </Button>
          )}
          {/* ✅ Only admin/member can add task */}
          {canEdit && (
            <Button size="sm" onClick={() => setShowTask(true)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/10 pb-0">
        {['tasks', 'members', 'activity'].map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'activity') loadActivity() }}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px
              ${tab === t ? 'text-brand-400 border-brand-500' : 'text-slate-500 border-transparent hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <TaskFilters onFilter={loadTasks} />
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setView('board')}
                className={`p-2 rounded-lg transition-colors ${view === 'board' ? 'bg-brand-600/20 text-brand-400' : 'text-slate-500 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-brand-600/20 text-brand-400' : 'text-slate-500 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* ✅ Bulk actions only for canEdit */}
          {selected.length > 0 && canEdit && (
            <div className="flex items-center gap-3 p-3 glass rounded-xl border border-brand-500/20 animate-fade-in">
              <span className="text-sm text-slate-400">{selected.length} selected</span>
              <div className="flex gap-2 ml-auto">
                <Button size="sm" variant="outline" onClick={() => handleBulkUpdate({ status: 'completed' })}>
                  Mark Completed
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkUpdate({ status: 'in_progress' })}>
                  In Progress
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="danger" onClick={handleBulkDelete}>Delete</Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => dispatch(clearSelected())}>Cancel</Button>
              </div>
            </div>
          )}

          {/* ✅ Checkboxes only for canEdit */}
          {tasks.length > 0 && view === 'list' && canEdit && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                onChange={(e) => e.target.checked ? dispatch(selectAll()) : dispatch(clearSelected())}
                className="rounded accent-brand-500"
              />
              Select all
            </div>
          )}

          {view === 'board'
            ? <TaskBoard tasks={tasks} loading={taskLoading} canEdit={canEdit} />
            : (
              <div className="space-y-2">
                {taskLoading
                  ? [1,2,3,4].map((i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)
                  : tasks.map((t) => <TaskCard key={t._id} task={t} canEdit={canEdit} />)
                }
                {!taskLoading && tasks.length === 0 && (
                  <div className="card text-center py-12">
                    <p className="text-3xl mb-3">📝</p>
                    <p className="text-slate-400">No tasks found</p>
                  </div>
                )}
              </div>
            )
          }
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="space-y-3">
          {project.members?.map((m) => {
            const role = PROJECT_ROLES[m.role]
            return (
              <div key={m.user?._id} className="card flex items-center gap-4">
                <Avatar user={m.user} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-200">{m.user?.name}</p>
                  <p className="text-xs text-slate-500">{m.user?.email}</p>
                </div>
                <Badge color={role?.color} bg={role?.bg}>{role?.label}</Badge>
                {/* ✅ Only admin can remove members */}
                {isAdmin && m.user?._id !== user?._id && (
                  <button className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-400/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div className="space-y-3">
          {activity.length === 0 ? (
            <div className="card text-center py-8 text-slate-500">No activity yet</div>
          ) : activity.map((log) => (
            <div key={log._id} className="flex items-start gap-3 p-3 glass rounded-xl">
              <Avatar user={log.user} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-300">
                  <span className="font-medium text-white">{log.user?.name}</span>{' '}
                  <span className="text-slate-400">{log.action?.replace(/_/g, ' ')}</span>
                  {log.meta?.title && <span className="text-brand-400"> "{log.meta.title}"</span>}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">{timeAgo(log.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals — only accessible if canEdit */}
      {canEdit && (
        <Modal open={showTask} onClose={() => setShowTask(false)} title="Create Task" size="lg">
          <TaskForm onSubmit={handleCreateTask} loading={creating} members={project.members} />
        </Modal>
      )}
      {isAdmin && (
        <InviteMemberModal open={showInvite} onClose={() => setShowInvite(false)} projectId={id} />
      )}
    </div>
  )
}