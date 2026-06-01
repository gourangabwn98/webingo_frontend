import TaskCard from './TaskCard'
import { TASK_STATUS } from '../../utils/constants'
import { TaskSkeleton } from '../ui/Skeleton'

const columns = Object.entries(TASK_STATUS)

export default function TaskBoard({ tasks, loading,canEdit = true }) {
  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(([key]) => (
        <div key={key} className="space-y-3">
          <div className="h-6 bg-white/5 rounded animate-pulse" />
          {[1,2].map((i) => <TaskSkeleton key={i} />)}
        </div>
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map(([key, meta]) => {
        const colTasks = tasks.filter((t) => t.status === key)
        return (
          <div key={key} className="space-y-3">
            {/* header unchanged */}
            <div className="space-y-2 min-h-24">
              {colTasks.map((task) => (
                <TaskCard key={task._id} task={task} canEdit={canEdit} />
              ))}
              {colTasks.length === 0 && (
                <div className="border border-dashed border-white/5 rounded-xl p-4 text-center text-xs text-slate-700">
                  No tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}