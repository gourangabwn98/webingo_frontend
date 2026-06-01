import { useDispatch, useSelector } from 'react-redux'
import { setFilters, selectFilters } from '../../features/tasks/tasksSlice'
import { useCallback } from 'react'

let debounceTimer

export default function TaskFilters({ onFilter }) {
  const dispatch = useDispatch()
  const filters  = useSelector(selectFilters)

  const update = (key, value) => {
    dispatch(setFilters({ [key]: value }))
    onFilter?.()
  }

  const handleSearch = useCallback((e) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => update('search', e.target.value), 400)
  }, [])

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-48">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="Search tasks..."
          onChange={handleSearch}
          className="input-field pl-9 text-sm"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => update('status', e.target.value)}
        className="input-field w-36 text-sm"
      >
        <option value="">All Status</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In Progress</option>
        <option value="review">Review</option>
        <option value="completed">Completed</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => update('priority', e.target.value)}
        className="input-field w-36 text-sm"
      >
        <option value="">All Priority</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>

      <select
        value={`${filters.sortBy}:${filters.sortOrder}`}
        onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(':')
          dispatch(setFilters({ sortBy, sortOrder }))
          onFilter?.()
        }}
        className="input-field w-40 text-sm"
      >
        <option value="createdAt:desc">Newest First</option>
        <option value="createdAt:asc">Oldest First</option>
        <option value="priority:desc">High Priority</option>
        <option value="dueDate:asc">Due Date</option>
      </select>
    </div>
  )
}