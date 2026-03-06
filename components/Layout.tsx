import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  Users,
  MessageSquare,
  Zap,
  Puzzle,
  Settings,
  Search,
  Bell,
  Plus,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/automations', label: 'Automações', icon: Workflow },
  { path: '/audience', label: 'Audiência', icon: Users },
  { path: '/conversations', label: 'Inbox', icon: MessageSquare },
  { path: '/growth-tools', label: 'Growth Tools', icon: Zap },
  { path: '/integrations', label: 'Integrações', icon: Puzzle },
  { path: '/analytics', label: 'Analytics', icon: LayoutDashboard }, // Using LayoutDashboard temporarily
  { path: '/settings', label: 'Configurações', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
          Fazza<span className="text-primary text-2xl leading-none">.</span>
        </h1>
        <button onClick={closeMobileMenu} className="md:hidden text-zinc-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="px-4 mb-6">
        <button className="w-full flex items-center gap-3 px-3 py-2 bg-zinc-900/50 border border-white/5 rounded-xl text-sm text-zinc-300 hover:bg-zinc-900 transition-colors group">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-emerald-600 text-black font-bold flex items-center justify-center text-xs shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">F</div>
          <div className="flex-1 text-left">
            <div className="font-medium text-white text-xs">Fazza HQ</div>
            <div className="text-[10px] text-zinc-500">Pro Plan</div>
          </div>
          <Settings size={14} className="text-zinc-500" />
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                  ? 'bg-zinc-800/80 text-white shadow-sm'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                }`}
            >
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-r-full" />}
              <item.icon size={18} className={isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-900/50 cursor-pointer transition">
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-white border border-white/10">JD</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">John Doe</p>
            <p className="text-xs text-zinc-500 truncate">john@fazza.io</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-[#09090b] text-zinc-100 overflow-hidden font-sans selection:bg-primary/30">

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-[260px] bg-[#09090b] border-r border-white/5">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeMobileMenu} />
          {/* Drawer */}
          <div className="absolute top-0 left-0 w-3/4 max-w-[300px] h-full bg-[#09090b] border-r border-white/10 flex flex-col shadow-2xl transform transition-transform duration-300">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Subtle Background Gradient Blob */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-primary/5 blur-[120px] pointer-events-none" />

        {/* Topbar */}
        <header className="h-16 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={toggleMobileMenu} className="md:hidden text-zinc-400 hover:text-white">
              <Menu size={24} />
            </button>
            <div className="md:hidden w-6 h-6 bg-primary rounded-full"></div>
          </div>

          <div className="hidden md:flex flex-1 max-w-sm">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white placeholder-zinc-600 focus:ring-1 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/automations/new" className="hidden md:flex items-center gap-2 bg-primary hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_20px_rgba(0,220,130,0.1)] hover:shadow-[0_0_25px_rgba(0,220,130,0.3)]">
              <Plus size={16} strokeWidth={3} />
              <span>Create</span>
            </Link>
            <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-zinc-800">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-[#09090b]"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-zinc-800 z-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};