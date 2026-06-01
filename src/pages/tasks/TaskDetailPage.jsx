import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getTaskApi, updateTaskApi, deleteTaskApi } from '../../features/tasks/tasksApi'
import { getProjectApi } from '../../features/projects/projectsApi'
import { updateTaskInList } from '../../features/tasks/tasksSlice'
import FileUpload from '../../components/tasks/FileUpload'
import TaskForm from '../../components/tasks/TaskForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants'
import { formatDate, timeAgo } from '../../utils/helpers'
import { joinTask, leaveTask } from '../../hooks/useSocket'
import toast from 'react-hot-toast'

export default function TaskDetailPage() {
  const { id, taskId } = useParams()
  const navigate       = useNavigate()
  const dispatch       = useDispatch()

  const [task,       setTask]       = useState(null)
  const [project,    setProject]    = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [showEdit,   setShowEdit]   = useState(false)
  const [updating,   setUpdating]   = useState(false)

  useEffect(() => {
    joinTask(taskId)
    loadData()
    return () => leaveTask(taskId)
  }, [taskId])

  const loadData = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([getTaskApi(id, taskId), getProjectApi(id)])
      setTask(taskRes.data.data.task)
      setProject(projRes.data.data.project)
    } finally { setLoading(false) }
  }

  const handleUpdate = async (data) => {
    setUpdating(true)
    try {
      const res = await updateTaskApi(id, taskId, data)
      setTask(res.data.data.task)
      dispatch(updateTaskInList(res.data.data.task))
      toast.success('Task updated!')
      setShowEdit(false)
    } catch { toast.error('Update failed') }
    finally { setUpdating(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return
    try {
      await deleteTaskApi(id, taskId)
      toast.success('Task deleted')
      navigate(`/projects/${id}`)
    } catch { toast.error('Delete failed') }
  }

  const handleQuickStatus = async (status) => {
    const res = await updateTaskApi(id, taskId, { status })
    setTask(res.data.data.task)
    dispatch(updateTaskInList(res.data.data.task))
    toast.success('Status updated')
  }

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-white/5 rounded w-2/3" />
      <div className="h-4 bg-white/5 rounded w-1/2" />
      <div className="h-40 bg-white/5 rounded-xl" />
    </div>
  )

  if (!task) return <div className="card text-center py-12"><p className="text-slate-400">Task not found</p></div>

  const status   = TASK_STATUS[task.status]
  const priority = TASK_PRIORITY[task.priority]

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <button onClick={() => navigate('/projects')} className="hover:text-white transition-colors">Projects</button>
        <span>/</span>
        <button onClick={() => navigate(`/projects/${id}`)} className="hover:text-white transition-colors">{project?.name}</button>
        <span>/</span>
        <span className="text-slate-300">{task.title}</span>
      </div>

      {/* Header */}
      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-bold text-white flex-1">{task.title}</h1>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowEdit(true)}>Edit</Button>
            <Button size="sm" variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge {...status}>{status?.label}</Badge>
          <Badge {...priority} dot={priority?.dot}>{priority?.label}</Badge>
          {task.dueDate && (
            <Badge color="text-slate-400" bg="bg-slate-400/10">📅 {formatDate(task.dueDate)}</Badge>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{task.description}</p>
        )}

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/5 pt-4">
          <div>
            <p className="text-slate-600 text-xs mb-2">Assignees</p>
            {task.assignees?.length ? (
              <div className="flex -space-x-2">
                {task.assignees.map((u) => <Avatar key={u._id} user={u} size="sm" className="ring-2 ring-surface-900" title={u.name} />)}
              </div>
            ) : <p className="text-slate-500 text-xs">Unassigned</p>}
          </div>
          <div>
            <p className="text-slate-600 text-xs mb-2">Created by</p>
            <div className="flex items-center gap-2">
              <Avatar user={task.createdBy} size="sm" />
              <span className="text-slate-400 text-xs">{task.createdBy?.name}</span>
            </div>
          </div>
        </div>

        {/* Quick Status Change */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-slate-600 mb-2">Quick Status</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(TASK_STATUS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => handleQuickStatus(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${task.status === key ? `${val.bg} ${val.color} ${val.border}` : 'border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-300'}`}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-600 border-t border-white/5 pt-3">
          Created {timeAgo(task.createdAt)} · Updated {timeAgo(task.updatedAt)}
        </div>
      </div>

      {/* File Attachments */}
      <div className="card space-y-4">
        <h2 className="section-title">Attachments</h2>
        <FileUpload
          taskId={task._id}
          attachments={task.attachments}
          onUpdate={() => loadData()}
        />
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Task" size="lg">
        <TaskForm
          onSubmit={handleUpdate}
          loading={updating}
          defaultValues={{
            title:       task.title,
            description: task.description,
            status:      task.status,
            priority:    task.priority,
            dueDate:     task.dueDate?.slice(0, 10),
            assignees:   task.assignees?.map((a) => a._id),
          }}
          members={project?.members}
        />
      </Modal>
    </div>
  )
}