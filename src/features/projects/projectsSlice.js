import { createSlice } from '@reduxjs/toolkit'

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    list:    [],
    current: null,
    loading: false,
    error:   null,
  },
  reducers: {
    setProjects(state, { payload })    { state.list    = payload },
    setCurrentProject(state, { payload }) { state.current = payload },
    addProject(state, { payload })     { state.list.unshift(payload) },
    updateProject(state, { payload })  {
      state.list = state.list.map((p) => p._id === payload._id ? payload : p)
      if (state.current?._id === payload._id) state.current = payload
    },
    removeProject(state, { payload })  {
      state.list = state.list.filter((p) => p._id !== payload)
      if (state.current?._id === payload) state.current = null
    },
    setLoading(state, { payload })     { state.loading = payload },
    setError(state, { payload })       { state.error   = payload },
  },
})

export const {
  setProjects, setCurrentProject, addProject,
  updateProject, removeProject, setLoading, setError,
} = projectsSlice.actions
export default projectsSlice.reducer
export const selectProjects       = (s) => s.projects.list
export const selectCurrentProject = (s) => s.projects.current
export const selectProjectsLoading= (s) => s.projects.loading