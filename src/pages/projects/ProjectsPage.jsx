import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getProjectsApi, createProjectApi } from '../../features/projects/projectsApi'
import { setProjects, addProject, selectProjects, selectProjectsLoading } from '../../features/projects/projectsSlice'
import ProjectCard from '../../components/projects/ProjectCard'
import ProjectForm from '../../components/projects/ProjectForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { ProjectSkeleton } from '../../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function ProjectsPage() {
  const dispatch  = useDispatch()
  const projects  = useSelector(selectProjects)
  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    getProjectsApi()
      .then((res) => dispatch(setProjects(res.data.data.projects)))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async (data) => {
    setCreating(true)
    try {
      const res = await createProjectApi(data)
      dispatch(addProject(res.data.data.project))
      toast.success('Project created!')
      setShowModal(false)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create')
    } finally { setCreating(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => <ProjectSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-4">🚀</p>
          <p className="text-slate-300 font-medium mb-2">No projects yet</p>
          <p className="text-slate-500 text-sm mb-6">Create your first project to start collaborating</p>
          <Button onClick={() => setShowModal(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Project">
        <ProjectForm onSubmit={handleCreate} loading={creating} />
      </Modal>
    </div>
  )
}