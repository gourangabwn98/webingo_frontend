import { createSlice } from '@reduxjs/toolkit'

const saved = JSON.parse(localStorage.getItem('auth') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:        saved?.user        || null,
    accessToken: saved?.accessToken || null,
    loading:     false,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user        = payload.user
      state.accessToken = payload.accessToken
      localStorage.setItem('auth', JSON.stringify({ user: payload.user, accessToken: payload.accessToken }))
    },
    setAccessToken(state, { payload }) {
      state.accessToken = payload
      const saved = JSON.parse(localStorage.getItem('auth') || '{}')
      localStorage.setItem('auth', JSON.stringify({ ...saved, accessToken: payload }))
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload }
      const saved = JSON.parse(localStorage.getItem('auth') || '{}')
      localStorage.setItem('auth', JSON.stringify({ ...saved, user: state.user }))
    },
    logout(state) {
      state.user        = null
      state.accessToken = null
      localStorage.removeItem('auth')
    },
    setLoading(state, { payload }) {
      state.loading = payload
    },
  },
})

export const { setCredentials, setAccessToken, updateUser, logout, setLoading } = authSlice.actions
export default authSlice.reducer
export const selectAuth    = (s) => s.auth
export const selectUser    = (s) => s.auth.user
export const selectIsAuth  = (s) => !!s.auth.accessToken