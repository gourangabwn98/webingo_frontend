import api from '../../services/api'

export const getTasksApi      = (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params })
export const getTaskApi       = (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`)
export const createTaskApi    = (projectId, data)   => api.post(`/projects/${projectId}/tasks`, data)
export const updateTaskApi    = (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data)
export const deleteTaskApi    = (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`)
export const bulkUpdateApi    = (projectId, data)   => api.post(`/projects/${projectId}/tasks/bulk-update`, data)
export const bulkDeleteApi    = (projectId, data)   => api.post(`/projects/${projectId}/tasks/bulk-delete`, data)
export const uploadFileApi    = (taskId, formData)  => api.post(`/files/${taskId}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteFileApi    = (taskId, attachId)  => api.delete(`/files/${taskId}/attachments/${attachId}`)