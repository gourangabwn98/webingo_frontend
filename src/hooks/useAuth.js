import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser, selectIsAuth, logout } from '../features/auth/authSlice'
import { logoutApi } from '../features/auth/authApi'
import toast from 'react-hot-toast'

export const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectUser)
  const isAuth    = useSelector(selectIsAuth)

  const handleLogout = async () => {
    try { await logoutApi() } catch {}
    dispatch(logout())
    navigate('/login')
    toast.success('Logged out successfully')
  }

  return { user, isAuth, handleLogout }
}