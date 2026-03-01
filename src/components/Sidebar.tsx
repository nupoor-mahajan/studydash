import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const navLinks = [
  { path: '/', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
  { path: '/planner', label: 'Planner', icon: 'fas fa-calendar-alt' },
  { path: '/notes', label: 'Notes', icon: 'fas fa-sticky-note' },
  { path: '/timer', label: 'Timer', icon: 'fas fa-clock' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('loggedIn')
    navigate('/login')
  }

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch { return {} }
  })()

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-1 z-50 text-white bg-none p-2 rounded-lg shadow-lg"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:sticky top-0 h-screen bg-brand-purple text-white p-4 flex flex-col z-40
          transition-all duration-300 ease-in-out border-r border-white/10
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* TOGGLE BUTTON */}
        <button
          className="hidden md:flex absolute top-10 -right-3 w-6 h-6 bg-brand-purple border border-white/20 rounded-md items-center justify-center text-white text-xs shadow-xl z-50 cursor-pointer hover:scale-110 transition-transform"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i className={`fas fa-chevron-${collapsed ? 'right' : 'left'}`} />
        </button>
            
        {/* LOGO SECTION: Icon on left, Text on right */}
        <div 
          className={`flex items-center mb-8 mt-2 overflow-hidden transition-all duration-300 ${collapsed ? 'justify-center' : 'px-2'}`}
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <div className="shrink-0">
            <img 
              src="/logo1.png" 
              alt="StudyDash Icon" 
              // We use a smaller width for just the icon part
              className="w-12 h-12 object-contain mix-blend-mode-multiply brightness-125" 
            />
          </div>
          {!collapsed && (
            <div className="ml-3">
              <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">
                Study<span className="text-green-400">Dash</span>
              </h1>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className={`mb-10 flex items-center transition-all duration-300 ${collapsed ? 'justify-center' : 'px-2'}`}>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/5">
            👤
          </div>
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold truncate">{user.name || 'User Profile'}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Student</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1">
          {navLinks.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                title={collapsed ? link.label : ''}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className={`
                  flex items-center p-3 rounded-xl transition-all duration-200 group
                  ${isActive ? 'bg-white/20 shadow-inner' : 'hover:bg-white/10'}
                `}
              >
                <i className={`${link.icon} w-6 text-center shrink-0 ${isActive ? 'text-green-400' : 'text-white/70 group-hover:text-white'}`} />
                <span className={`ml-3 font-medium transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                  {link.label}
                </span>
                {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_#4ade80]" />}
              </button>
            )
          })}
        </nav>

        {/* Logout Section */}
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center p-3 rounded-xl text-red-300 hover:bg-red-500/10 hover:text-red-100 transition-all group"
        >
          <i className="fas fa-sign-out-alt w-6 text-center shrink-0" />
          <span className={`ml-3 font-medium ${collapsed ? 'hidden' : 'block'}`}>
            Logout
          </span>
        </button>
      </div>
    </>
  )
}