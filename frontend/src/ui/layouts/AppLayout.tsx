/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { Outlet, NavLink } from 'react-router-dom';
import { Package, FileText, BarChart3, Settings, LogOut, Hexagon } from 'lucide-react';

export default function AppLayout(): JSX.Element {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 shadow-sm flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Hexagon className="w-8 h-8 text-indigo-600 mr-2" />
          <span className="text-xl font-bold text-slate-800 tracking-tight">OpticsPro</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {[
            { path: '/pos', icon: <Package className="w-5 h-5" />, label: 'Point of Sale' },
            { path: '/inventory', icon: <Package className="w-5 h-5" />, label: 'Inventory' },
            { path: '/prescriptions', icon: <FileText className="w-5 h-5" />, label: 'Prescriptions' },
            { path: '/reports', icon: <BarChart3 className="w-5 h-5" />, label: 'Reports' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <NavLink
            to="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all duration-200 font-medium"
          >
            <Settings className="w-5 h-5" />
            Settings
          </NavLink>
          <button className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 font-medium">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0 z-10">
          <h2 className="text-xl font-semibold text-slate-800">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shadow-sm">
              AD
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-slate-50 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
