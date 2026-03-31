import { Link } from 'react-router-dom';

export default function Navbar({ onToggleMobileSidebar = null }) {

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

            <div className="flex items-center justify-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-200 via-sky-200 to-blue-300 text-slate-900 shadow-lg shadow-cyan-200/25">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16l3.5-5L14 8l4 3 2 5" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-black leading-none tracking-[0.08em] text-slate-900">CRUSHERBOOK</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
              </div>
            </div>

            <div className="w-10" aria-hidden="true" />
          </div>

          <div className="flex items-center justify-center gap-2">
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/25">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M6 16l3.5-5L14 8l4 3 2 5" />
              </svg>
            </div>
            <div>
              <p className="text-[19px] font-black tracking-[0.08em] text-slate-900">CRUSHERBOOK</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
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
