import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { selectUser } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'

const titles = {
  '/dashboard': 'Dashboard',
  '/projects':  'Projects',
}

export default function Navbar() {
  const user     = useSelector(selectUser)
  const location = useLocation()
  const { handleLogout } = useAuth()

  const title = Object.entries(titles).find(([path]) => location.pathname.startsWith(path))?.[1] || 'CollabPM'

  return (
    <header className="h-14 glass-dark border-b border-white/5 flex items-center px-6 gap-4 flex-shrink-0">
      <h1 className="font-display font-semibold text-white flex-1">{title}</h1>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <Avatar user={user} size="sm" className="cursor-pointer" />
      </div>
    </header>
  )
}