import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { deleteProjectApi } from '../../features/projects/projectsApi'
import { removeProject } from '../../features/projects/projectsSlice'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Dropdown from '../ui/Dropdown'
import { timeAgo } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function ProjectCard({ project }) {
  const navigate  = useNavigate()
  const dispatch  = useDispatch()

  const handleDelete = async () => {
    if (!confirm('Delete this project?')) return
    try {
      await deleteProjectApi(project._id)
      dispatch(removeProject(project._id))
      toast.success('Project deleted')
    } catch { toast.error('Failed to delete') }
  }

  const menuItems = [
    { label: 'Open Project', icon: '📂', onClick: () => navigate(`/projects/${project._id}`) },
    { label: 'Delete',       icon: '🗑️', onClick: handleDelete, danger: true },
  ]

  return (
    <div
      className="card group hover:border-brand-500/30 border border-transparent transition-all duration-300 cursor-pointer relative"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-semibold text-white truncate group-hover:text-brand-300 transition-colors">{project.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{project.description || 'No description'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <Badge
            color={project.status === 'active' ? 'text-green-400' : 'text-slate-400'}
            bg={project.status === 'active' ? 'bg-green-400/10' : 'bg-slate-400/10'}
          >
            {project.status}
          </Badge>
          <Dropdown trigger={
            <button className="p-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          } items={menuItems} />
        </div>
      </div>

      {/* Members */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex -space-x-2">
          {project.members?.slice(0, 4).map((m) => (
            <Avatar key={m.user?._id} user={m.user} size="sm" className="ring-2 ring-surface-900" />
          ))}
          {project.members?.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-surface-800 ring-2 ring-surface-900 flex items-center justify-center text-xs text-slate-400 font-medium">
              +{project.members.length - 4}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-600">{timeAgo(project.updatedAt)}</p>
      </div>
    </div>
  )
}