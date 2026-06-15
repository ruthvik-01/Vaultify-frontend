import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FolderLock, LayoutDashboard, FolderClosed, UploadCloud, 
  Users, Trash2, User, Settings, X, GraduationCap 
} from 'lucide-react';
import StorageCard from './StorageCard';

export default function Sidebar({ onClose }) {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Files', path: '/my-files', icon: FolderClosed },
    { name: 'Upload Files', path: '/upload', icon: UploadCloud },
    { name: 'Shared Files', path: '/shared', icon: Users },
    { name: 'Trash Bin', path: '/trash', icon: Trash2 },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen bg-brand-cream-dark border-r border-brand-sand/80 flex flex-col justify-between p-6 overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-olive text-brand-cream p-2 rounded-xl">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-lg font-bold tracking-tight text-brand-charcoal block">StudentVault</span>
              <span className="text-[10px] text-brand-olive-dark font-sans tracking-wide uppercase font-semibold">Career Locker</span>
            </div>
          </div>
          {/* Close button for Mobile drawers */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-brand-sand transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose} // close mobile drawer
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-brand-olive text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-brand-sand/40 hover:text-brand-charcoal'
                  }
                `}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 duration-200 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Storage & User Quota at the bottom */}
      <div className="mt-8 pt-6 border-t border-brand-sand">
        <StorageCard />
        <div className="mt-4 flex items-center space-x-2.5 px-2 text-xs text-gray-500">
          <GraduationCap className="w-4 h-4 text-brand-olive" />
          <span className="truncate">Student Account Verified</span>
        </div>
      </div>
    </aside>
  );
}
