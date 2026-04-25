import { Link, useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';

export default function Navbar({ onToggleMobileSidebar = null, activeView = 'daybook', setActiveView }) {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.95),rgba(241,245,249,0.94))] shadow-[0_18px_40px_rgba(148,163,184,0.2)] backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              aria-label="Open mobile sidebar"
              onClick={() => onToggleMobileSidebar?.()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-cyan-300/60 hover:bg-cyan-50"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Ledger Buttons */}
          <div className="flex flex-wrap items-center justify-start gap-2">
            <button
              type="button"
              onClick={() => setActiveView?.('party-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                activeView === 'party-ledger'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Party Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('daybook')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                activeView === 'daybook'
                  ? 'border-sky-300 bg-sky-100 text-sky-800'
                  : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              Day Book
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports/boulder-ledger')}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100"
            >
              Boulder Ledger
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports/sales-report')}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[10px] font-bold text-violet-700 transition hover:bg-violet-100"
            >
              Sales Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('expense-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                activeView === 'expense-ledger'
                  ? 'border-rose-300 bg-rose-100 text-rose-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Expense Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('material-used-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                activeView === 'material-used-ledger'
                  ? 'border-cyan-300 bg-cyan-100 text-cyan-800'
                  : 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              Material Used Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('stock-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition ${
                activeView === 'stock-ledger'
                  ? 'border-indigo-300 bg-indigo-100 text-indigo-800'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Stock Ledger
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
            <Link
              to="/masters"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-cyan-300/60 hover:bg-cyan-50 hover:text-slate-900"
            >
              Masters
            </Link>
            <Link
              to="/settings"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 transition hover:border-cyan-300/60 hover:bg-cyan-50 hover:text-slate-900"
            >
              Setting
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-6">
          {/* Left Side Ledger Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView?.('party-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
                activeView === 'party-ledger'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Party Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('daybook')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
                activeView === 'daybook'
                  ? 'border-sky-300 bg-sky-100 text-sky-800'
                  : 'border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100'
              }`}
            >
              Day Book
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports/boulder-ledger')}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs"
            >
              Boulder Ledger
            </button>
            <button
              type="button"
              onClick={() => navigate('/reports/sales-report')}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs"
            >
              Sales Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('expense-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
                activeView === 'expense-ledger'
                  ? 'border-rose-300 bg-rose-100 text-rose-800'
                  : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Expense Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('material-used-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
                activeView === 'material-used-ledger'
                  ? 'border-cyan-300 bg-cyan-100 text-cyan-800'
                  : 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
              }`}
            >
              Material Used Ledger
            </button>
            <button
              type="button"
              onClick={() => setActiveView?.('stock-ledger')}
              className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
                activeView === 'stock-ledger'
                  ? 'border-indigo-300 bg-indigo-100 text-indigo-800'
                  : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Stock Ledger
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/analytics')}
              className="ml-2 inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700 shadow-sm"
            >
              <BarChart2 className="w-3.5 h-3.5" /> Analytics
            </button>
          </div>

          <nav className="flex items-center justify-end gap-2">
            {[
              { label: 'Masters', path: '/masters' },
              { label: 'Reports', path: '/reports' },
              { label: 'Setting', path: '/settings' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700 transition hover:border-cyan-300/60 hover:bg-cyan-50 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
