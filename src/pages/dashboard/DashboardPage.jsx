import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { getProjectsApi } from '../../features/projects/projectsApi'
import { setProjects } from '../../features/projects/projectsSlice'
import { selectProjects } from '../../features/projects/projectsSlice'
import { selectUser } from '../../features/auth/authSlice'
import { ProjectSkeleton } from '../../components/ui/Skeleton'
import ProjectCard from '../../components/projects/ProjectCard'
import { useState } from 'react'

export default function DashboardPage() {
  const dispatch  = useDispatch()
  const projects  = useSelector(selectProjects)
  const user      = useSelector(selectUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjectsApi()
      .then((res) => dispatch(setProjects(res.data.data.projects)))
      .finally(() => setLoading(false))
  }, [])

  const active   = projects.filter((p) => p.status === 'active').length
  const archived = projects.filter((p) => p.status === 'archived').length

  const stats = [
    { label: 'Total Projects', value: projects.length, icon: '📁', color: 'text-brand-400' },
    { label: 'Active',         value: active,           icon: '✅', color: 'text-green-400' },
    { label: 'Archived',       value: archived,         icon: '📦', color: 'text-yellow-400' },
    { label: 'Teams Joined',   value: projects.reduce((a, p) => a + p.members.length, 0), icon: '👥', color: 'text-blue-400' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-3xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1">Here's what's happening across your projects.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Projects</h2>
          <Link to="/projects" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">View all →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <ProjectSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-400 mb-4">No projects yet</p>
            <Link to="/projects" className="btn-primary inline-flex items-center gap-2">Create your first project</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((p) => <ProjectCard key={p._id} project={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}