import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { setConnected } from '../features/socket/socketSlice'
import { addTask, updateTaskInList, removeTask } from '../features/tasks/tasksSlice'
import { selectIsAuth, selectAuth } from '../features/auth/authSlice'
import toast from 'react-hot-toast'

let socketInstance = null

export const useSocket = () => {
  const dispatch   = useDispatch()
  const isAuth     = useSelector(selectIsAuth)
  const { accessToken } = useSelector(selectAuth)

  useEffect(() => {
    if (!isAuth || !accessToken) return
    if (socketInstance?.connected) return

    socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: accessToken },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketInstance.on('connect',    () => { dispatch(setConnected(true));  console.log('🔌 Socket connected') })
    socketInstance.on('disconnect', () => { dispatch(setConnected(false)); console.log('❌ Socket disconnected') })

    socketInstance.on('task:created',      (task) => { dispatch(addTask(task)); toast.success(`New task: ${task.title}`) })
    socketInstance.on('task:updated',      (task) => { dispatch(updateTaskInList(task)) })
    socketInstance.on('task:deleted',      ({ taskId }) => { dispatch(removeTask(taskId)) })
    socketInstance.on('task:bulk_updated', () => {})
    socketInstance.on('task:bulk_deleted', ({ taskIds }) => { taskIds.forEach((id) => dispatch(removeTask(id))) })

    socketInstance.on('user:joined', ({ name }) => toast(`${name} joined the project`, { icon: '👋' }))

    return () => {
      socketInstance?.disconnect()
      socketInstance = null
      dispatch(setConnected(false))
    }
  }, [isAuth, accessToken])

  return socketInstance
}

export const getSocket = () => socketInstance

export const joinProject = (projectId) => socketInstance?.emit('join:project', projectId)
export const leaveProject = (projectId) => socketInstance?.emit('leave:project', projectId)
export const joinTask = (taskId) => socketInstance?.emit('join:task', taskId)
export const leaveTask = (taskId) => socketInstance?.emit('leave:task', taskId)