import api from '../../services/api'

export const registerApi    = (data)          => api.post('/auth/register', data)
export const loginApi       = (data)          => api.post('/auth/login', data)
export const logoutApi      = ()              => api.post('/auth/logout')
export const getMeApi       = ()              => api.get('/auth/me')
export const forgotApi      = (data)          => api.post('/auth/forgot-password', data)
export const resetApi       = (token, data)   => api.post(`/auth/reset-password/${token}`, data)
export const refreshApi     = ()              => api.post('/auth/refresh')