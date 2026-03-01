import { ReactNode } from 'react'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // 'h-screen' ensures the wrapper is exactly the height of the window
    <div className="flex h-screen overflow-hidden bg-fixed bg-gradient-to-br from-[#1a1c2c] via-[#4a1942] to-[#12c2e9]" id="wrapper">
      <Sidebar />
      {/* 'overflow-y-auto' allows the dashboard to scroll while the sidebar stays put */}
      <div className="dashboard-container flex-1 overflow-y-auto p-4 md:p-8">
        {children}
      </div>
    </div>
  )
}