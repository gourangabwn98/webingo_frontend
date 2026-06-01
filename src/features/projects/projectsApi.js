import api from '../../services/api'

export const getProjectsApi     = ()               => api.get('/projects')
export const getProjectApi      = (id)             => api.get(`/projects/${id}`)
export const createProjectApi   = (data)           => api.post('/projects', data)
export const updateProjectApi   = (id, data)       => api.put(`/projects/${id}`, data)
export const deleteProjectApi   = (id)             => api.delete(`/projects/${id}`)
export const inviteMemberApi    = (id, data)       => api.post(`/projects/${id}/invite`, data)
export const removeMemberApi    = (id, memberId)   => api.delete(`/projects/${id}/members/${memberId}`)
export const getActivityApi     = (id, params)     => api.get(`/projects/${id}/activity`, { params })
export const acceptInviteApi    = (token)          => api.get(`/projects/invite/${token}`)