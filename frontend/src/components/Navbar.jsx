import { Link, useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Users, 
  BookOpen, 
  Package, 
  TrendingUp, 
  Receipt, 
  Database, 
  Layers,
  Settings,
  ClipboardList
} from 'lucide-react';

const LEDGER_BUTTONS = [
  { id: 'party-ledger', label: 'Party', icon: Users, color: 'emerald' },
  { id: 'daybook', label: 'Day Book', icon: BookOpen, color: 'sky' },
  { id: 'boulder-ledger', label: 'Boulder', icon: Package, color: 'amber', path: '/reports/boulder-ledger' },
  { id: 'sales-report', label: 'Sales', icon: TrendingUp, color: 'violet', path: '/reports/sales-report' },
  { id: 'expense-ledger', label: 'Expense', icon: Receipt, color: 'rose' },
  { id: 'material-used-ledger', label: 'Material', icon: Database, color: 'cyan' },
  { id: 'stock-ledger', label: 'Stock', icon: Layers, color: 'indigo' },
];

export default function Navbar({ onToggleMobileSidebar = null, activeView = 'daybook', setActiveView }) {
  const navigate = useNavigate();

  const getButtonStyles = (btn, isActive) => {
    const config = {
      emerald: {
        bg: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/30',
        active: 'ring-emerald-400 ring-offset-2 ring-2 scale-105'
      },
      sky: {
        bg: 'from-sky-500 to-blue-600',
        shadow: 'shadow-sky-500/30',
        active: 'ring-sky-400 ring-offset-2 ring-2 scale-105'
      },
      amber: {
        bg: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/30',
        active: 'ring-amber-400 ring-offset-2 ring-2 scale-105'
      },
      violet: {
        bg: 'from-violet-500 to-purple-600',
        shadow: 'shadow-violet-500/30',
        active: 'ring-violet-400 ring-offset-2 ring-2 scale-105'
      },
      rose: {
        bg: 'from-rose-500 to-pink-600',
        shadow: 'shadow-rose-500/30',
        active: 'ring-rose-400 ring-offset-2 ring-2 scale-105'
      },
      cyan: {
        bg: 'from-cyan-500 to-sky-600',
        shadow: 'shadow-cyan-500/30',
        active: 'ring-cyan-400 ring-offset-2 ring-2 scale-105'
      },
      indigo: {
        bg: 'from-indigo-500 to-blue-700',
        shadow: 'shadow-indigo-500/30',
        active: 'ring-indigo-400 ring-offset-2 ring-2 scale-105'
      }
    };

    const style = config[btn.color];
    return `flex items-center gap-2 rounded-2xl bg-gradient-to-br ${style.bg} px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 shadow-lg ${style.shadow} hover:-translate-y-0.5 hover:brightness-110 ${isActive ? style.active : 'opacity-90 hover:opacity-100'}`;
  };

  const handleButtonClick = (btn) => {
    if (btn.path) {
      navigate(btn.path);
    } else {
      setActiveView?.(btn.id);
    }
  };

  return (
    <header className="w-full border-b border-slate-200/60 bg-white/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto w-full max-w-[98rem] px-4 py-3 sm:px-6">
        {/* Mobile View */}
        <div className="flex flex-col gap-4 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => onToggleMobileSidebar?.()}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 shadow-md"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex gap-2">
              <Link to="/masters" className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-200">
                <ClipboardList size={20} />
              </Link>
              <Link to="/settings" className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg shadow-slate-200">
                <Settings size={20} />
              </Link>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide">
            {LEDGER_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleButtonClick(btn)}
                className={getButtonStyles(btn, activeView === btn.id)}
              >
                <btn.icon size={14} strokeWidth={2.5} />
                <span className="whitespace-nowrap">{btn.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="flex items-center gap-3 overflow-x-auto [scrollbar-width:none]">
            {LEDGER_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                onClick={() => handleButtonClick(btn)}
                className={getButtonStyles(btn, activeView === btn.id)}
              >
                <btn.icon size={15} strokeWidth={2.5} />
                <span>{btn.label}</span>
              </button>
            ))}
            
          </div>

          <nav className="flex items-center gap-4">
            {[
              { label: 'Masters', path: '/masters', icon: ClipboardList, color: 'from-blue-600 to-indigo-700' },
              { label: 'Reports', path: '/reports', icon: BarChart2, color: 'from-sky-600 to-blue-700' },
              { label: 'Settings', path: '/settings', icon: Settings, color: 'from-slate-600 to-slate-800' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 rounded-full bg-gradient-to-br ${item.color} px-6 py-2.5 text-[11px] font-bold uppercase tracking-wider text-white transition-all duration-300 shadow-lg hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110`}
              >
                <item.icon size={14} strokeWidth={2.5} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
