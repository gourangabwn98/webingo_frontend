// import { NavLink, useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import { selectProjects } from '../../features/projects/projectsSlice'
// import { useAuth } from '../../hooks/useAuth'
// import Avatar from '../ui/Avatar'
// import { clsx } from '../../utils/helpers'

// const navItems = [
//   { to: '/dashboard', label: 'Dashboard', icon: (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
//   )},
//   { to: '/projects', label: 'Projects', icon: (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
//   )},
// ]

// export default function Sidebar() {
//   const projects = useSelector(selectProjects)
//   const { user, handleLogout } = useAuth()

//   return (
//     <aside className="w-64 flex-shrink-0 glass-dark border-r border-white/5 flex flex-col">
//       {/* Logo */}
//       <div className="p-5 border-b border-white/5">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
//             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//             </svg>
//           </div>
//           <span className="font-display text-lg font-bold text-white">CollabPM</span>
//         </div>
//       </div>

//       {/* Nav */}
//       <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
//         {navItems.map((item) => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             className={({ isActive }) => clsx(
//               'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
//               isActive ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
//             )}
//           >
//             {item.icon}
//             {item.label}
//           </NavLink>
//         ))}

//         {/* Projects List */}
//         {projects.length > 0 && (
//           <div className="pt-4">
//             <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Recent Projects</p>
//             <div className="space-y-0.5">
//               {projects.slice(0, 5).map((p) => (
//                 <NavLink
//                   key={p._id}
//                   to={`/projects/${p._id}`}
//                   className={({ isActive }) => clsx(
//                     'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 truncate',
//                     isActive ? 'bg-brand-600/20 text-brand-400' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
//                   )}
//                 >
//                   <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', p.status === 'active' ? 'bg-green-500' : 'bg-slate-600')} />
//                   <span className="truncate">{p.name}</span>
//                 </NavLink>
//               ))}
//             </div>
//           </div>
//         )}
//       </nav>

//       {/* User */}
//       <div className="p-3 border-t border-white/5">
//         <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
//           <Avatar user={user} size="sm" />
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-medium text-slate-300 truncate">{user?.name}</p>
//             <p className="text-xs text-slate-600 truncate">{user?.email}</p>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 p-1 rounded"
//             title="Logout"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </aside>
//   )
// }
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectProjects } from '../../features/projects/projectsSlice'
import { useAuth } from '../../hooks/useAuth'
import Avatar from '../ui/Avatar'
import { clsx } from '../../utils/helpers'

const navItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/projects',
    label: 'Projects',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
]

export default function Sidebar({ open, onClose }) {
  const projects = useSelector(selectProjects)
  const { user, handleLogout } = useAuth()

  return (
    <>
      {/* Sidebar panel */}
      <aside
        className={clsx(
          // Base styles
          'flex flex-col flex-shrink-0 glass-dark border-r border-white/5 z-50 transition-transform duration-300 ease-in-out',
          // Mobile: fixed overlay, slide in/out
          'fixed inset-y-0 left-0 w-72 lg:w-64',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo + close button */}
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="font-display text-lg font-bold text-white">CollabPM</span>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                )
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          {/* Recent Projects */}
          {projects.length > 0 && (
            <div className="pt-4">
              <p className="px-3 text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Recent Projects
              </p>
              <div className="space-y-0.5">
                {projects.slice(0, 5).map((p) => (
                  <NavLink
                    key={p._id}
                    to={`/projects/${p._id}`}
                    onClick={onClose}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 truncate',
                        isActive
                          ? 'bg-brand-600/20 text-brand-400'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                      )
                    }
                  >
                    <span
                      className={clsx(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        p.status === 'active' ? 'bg-green-500' : 'bg-slate-600'
                      )}
                    />
                    <span className="truncate">{p.name}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* User footer */}
       {/* User footer */}
<div className="p-3 border-t border-white/5 space-y-1">
  {/* Logout button */}
  <button
    onClick={() => { handleLogout(); onClose() }}
    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200"
  >
    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
    Logout
  </button>

  {/* User info */}
  <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
    <Avatar user={user} size="sm" />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-300 truncate">{user?.name}</p>
      <p className="text-xs text-slate-600 truncate">{user?.email}</p>
    </div>
  </div>
</div>
      </aside>
    </>
  )
}