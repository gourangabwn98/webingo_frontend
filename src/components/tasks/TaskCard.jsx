import { useDispatch, useSelector } from 'react-redux'
import { toggleSelected, selectSelected } from '../../features/tasks/tasksSlice'
import Badge from '../ui/Badge'
import Avatar from '../ui/Avatar'
import { TASK_STATUS, TASK_PRIORITY } from '../../utils/constants'
import { formatDate, clsx } from '../../utils/helpers'
import { useNavigate, useParams } from 'react-router-dom'

export default function TaskCard({ task, canEdit = true }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { id }    = useParams()
  const selected  = useSelector(selectSelected)
  const isSelected = selected.includes(task._id)

  const status   = TASK_STATUS[task.status]
  const priority = TASK_PRIORITY[task.priority]

  return (
    <div
      className={clsx(
        'card group cursor-pointer hover:border-brand-500/20 border transition-all duration-200',
        isSelected ? 'border-brand-500/40 bg-brand-600/5' : 'border-transparent'
      )}
      onClick={() => navigate(`/projects/${id}/tasks/${task._id}`)}
    >
      <div className="flex items-start gap-3">
       {canEdit && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => { e.stopPropagation(); dispatch(toggleSelected(task._id)) }}
          onClick={(e) => e.stopPropagation()}
          className="mt-1 w-4 h-4 rounded border-white/20 bg-surface-800 accent-brand-500 cursor-pointer flex-shrink-0"
        />
       )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-medium text-slate-200 text-sm leading-snug group-hover:text-white transition-colors truncate">{task.title}</p>
            <Badge {...priority} className="flex-shrink-0">{priority?.label}</Badge>
          </div>
          {task.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge {...status}>{status?.label}</Badge>
              {task.dueDate && (
                <span className="text-xs text-slate-600">{formatDate(task.dueDate)}</span>
              )}
            </div>
            <div className="flex -space-x-1.5">
              {task.assignees?.slice(0, 3).map((u) => (
                <Avatar key={u._id} user={u} size="sm" className="ring-2 ring-surface-900" />
              ))}
            </div>
          </div>
          {task.attachments?.length > 0 && (
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              {task.attachments.length} file{task.attachments.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}