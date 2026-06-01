import { createSlice } from '@reduxjs/toolkit'

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    list:        [],
    current:     null,
    total:       0,
    page:        1,
    totalPages:  1,
    loading:     false,
    filters:     { status: '', priority: '', search: '', sortBy: 'createdAt', sortOrder: 'desc' },
    selected:    [],
    activeUsers: {},
  },
  reducers: {
    setTasks(state, { payload }) {
      state.list       = payload.tasks
      state.total      = payload.total
      state.page       = payload.page
      state.totalPages = payload.totalPages
    },
    setCurrentTask(state, { payload })  { state.current = payload },
    addTask(state, { payload })         { state.list.unshift(payload) },
    updateTaskInList(state, { payload }) {
      state.list = state.list.map((t) => t._id === payload._id ? payload : t)
      if (state.current?._id === payload._id) state.current = payload
    },
    removeTask(state, { payload })      { state.list = state.list.filter((t) => t._id !== payload) },
    setLoading(state, { payload })      { state.loading = payload },
    setFilters(state, { payload })      { state.filters = { ...state.filters, ...payload } },
    toggleSelected(state, { payload })  {
      state.selected = state.selected.includes(payload)
        ? state.selected.filter((id) => id !== payload)
        : [...state.selected, payload]
    },
    clearSelected(state)                { state.selected = [] },
    selectAll(state)                    { state.selected = state.list.map((t) => t._id) },
    setActiveUsers(state, { payload })  { state.activeUsers = payload },
    addActiveUser(state, { payload })   { state.activeUsers[payload.taskId] = [...(state.activeUsers[payload.taskId] || []), payload.user] },
    removeActiveUser(state, { payload }){ state.activeUsers[payload.taskId] = (state.activeUsers[payload.taskId] || []).filter((u) => u.id !== payload.userId) },
  },
})

export const {
  setTasks, setCurrentTask, addTask, updateTaskInList, removeTask,
  setLoading, setFilters, toggleSelected, clearSelected, selectAll,
  setActiveUsers, addActiveUser, removeActiveUser,
} = tasksSlice.actions
export default tasksSlice.reducer
export const selectTasks    = (s) => s.tasks.list
export const selectFilters  = (s) => s.tasks.filters
export const selectSelected = (s) => s.tasks.selected
export const selectTaskMeta = (s) => ({ total: s.tasks.total, page: s.tasks.page, totalPages: s.tasks.totalPages })