// import { useEffect } from 'react'
// import { Outlet } from 'react-router-dom'
// import Sidebar from './Sidebar'
// import Navbar from './Navbar'
// import { useSocket } from '../../hooks/useSocket'

// export default function AppLayout() {
//   useSocket() // initialize socket connection

//   return (
//     <div className="flex h-screen overflow-hidden">
//       <Sidebar />
//       <div className="flex-1 flex flex-col overflow-hidden">
//         <Navbar />
//         <main className="flex-1 overflow-y-auto p-6">
//           <div className="max-w-7xl mx-auto animate-fade-in">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useSocket } from '../../hooks/useSocket'

export default function AppLayout() {
  useSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}