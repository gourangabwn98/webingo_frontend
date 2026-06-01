import { useSelector } from 'react-redux'
import { selectUser } from '../features/auth/authSlice'

export const useProjectRole = (project) => {
  const user = useSelector(selectUser)
  if (!project || !user) return { role: null, isAdmin: false, isMember: false, isViewer: true, canEdit: false }

  const isOwner  = project.owner?._id === user._id || project.owner === user._id
  const member   = project.members?.find((m) => m.user?._id === user._id || m.user === user._id)
  const role     = isOwner ? 'project_admin' : member?.role || null

  const isAdmin  = role === 'project_admin'
  const isMember = role === 'team_member'
  const isViewer = role === 'viewer'
  const canEdit  = isAdmin || isMember  // viewer cannot edit

  return { role, isAdmin, isMember, isViewer, canEdit }
}