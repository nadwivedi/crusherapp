import { useMemo, useState } from 'react';

export const homeQuickShortcuts = [
  { label: 'Boulder Entry', hint: '', combo: '', stateKey: 'homeQuickBoulder', imageSrc: '/buttons/boulder.png', imageClassName: 'sm:scale-58' },
  { label: 'New Sale', hint: '', combo: '', stateKey: 'homeQuickSale', imageSrc: '/buttons/add sales.png', imageClassName: 'sm:scale-58' },
  { label: 'New Payment', hint: 'Money Paid', combo: '', stateKey: 'homeQuickPayment', imageSrc: '/buttons/money paid.png', imageClassName: 'sm:scale-90' },
  { label: 'New Receipt', hint: 'Money Received', combo: '', stateKey: 'homeQuickReceipt', imageSrc: '/buttons/money received.png' },
  { label: 'Material Used', hint: '', combo: '', stateKey: 'homeQuickMaterialUsed', imageSrc: '/buttons/material used.png' },
  { label: 'New Expense', hint: '', combo: 'Alt + 6', stateKey: 'homeQuickExpense', imageSrc: '/buttons/new expense.png', imageClassName: 'sm:scale-58' },
  { label: 'Purchase Return', hint: '', combo: '', stateKey: 'homeQuickPurchaseReturn', accent: 'from-rose-500 to-pink-500', collapsible: true },
  { label: 'Sale Return', hint: '', combo: '', path: '/sale-return', accent: 'from-amber-500 to-orange-500', collapsible: true },
  { label: 'Stock Adjustment', hint: '', combo: '', path: '/stock-adjustment', accent: 'from-violet-500 to-fuchsia-500', collapsible: true }
];

export const getHomeQuickShortcut = (target) => (
  homeQuickShortcuts.find((item) => item.stateKey === target || item.path === target)
);

export default function Sidebar({
  shortcuts = homeQuickShortcuts,
  activeShortcutIndex,
  onOpenShortcut,
  onHighlightShortcut
}) {
  const [showExtraShortcuts, setShowExtraShortcuts] = useState(false);

  const visibleShortcuts = useMemo(() => (
    showExtraShortcuts
      ? shortcuts
      : shortcuts.filter((shortcut) => !shortcut.collapsible)
  ), [shortcuts, showExtraShortcuts]);

  return (
    <aside className="relative w-full overflow-hidden rounded-[20px] border border-slate-200/15 bg-[linear-gradient(165deg,rgba(30,41,59,0.92),rgba(51,65,85,0.9),rgba(71,85,105,0.88))] shadow-[0_24px_60px_rgba(15,23,42,0.34),0_0_42px_rgba(14,165,233,0.08)] sm:rounded-[30px] lg:sticky lg:top-4 lg:self-start xl:top-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_28%)]" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex flex-1 flex-col gap-2 px-2 py-2 sm:gap-2.5 sm:px-3 sm:py-3 lg:gap-2 lg:px-2.5 lg:py-2.5 xl:px-3 xl:py-3">
          {visibleShortcuts.map((shortcut) => {
            const originalIndex = shortcuts.findIndex((item) => (item.stateKey || item.path) === (shortcut.stateKey || shortcut.path));
            const isActive = originalIndex === activeShortcutIndex;

            return (
              <button
                key={shortcut.stateKey || shortcut.path}
                type="button"
                onClick={() => onOpenShortcut(shortcut.stateKey || shortcut.path)}
                onMouseEnter={() => onHighlightShortcut(originalIndex)}
                onFocus={() => onHighlightShortcut(originalIndex)}
                className={
                  shortcut.imageSrc
                    ? `cursor-pointer overflow-visible rounded-xl bg-transparent px-0 py-0.5 text-left shadow-none transition hover:-translate-y-0.5 hover:shadow-none ${isActive ? 'sm:-translate-y-0.5 sm:rounded-2xl sm:bg-amber-300/12 sm:ring-2 sm:ring-amber-300/80 sm:ring-offset-2 sm:ring-offset-slate-800' : ''}`
                    : `cursor-pointer rounded-xl border border-slate-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-2 text-left shadow-[0_14px_30px_rgba(148,163,184,0.16),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(148,163,184,0.22),inset_0_1px_0_rgba(255,255,255,0.95)] sm:rounded-2xl sm:p-2.5 lg:p-2 xl:p-2.5 ${isActive ? 'sm:border-amber-300 sm:bg-[linear-gradient(180deg,rgba(255,251,235,1),rgba(254,243,199,0.95))] sm:ring-2 sm:ring-amber-200/95 sm:shadow-[0_18px_34px_rgba(245,158,11,0.18),inset_0_1px_0_rgba(255,255,255,0.98)]' : ''}`
                }
              >
                {shortcut.imageSrc ? (
                  <div className="relative">
                    <img
                      src={shortcut.imageSrc}
                      alt={shortcut.hint || shortcut.label}
                      className={`h-auto w-full scale-100 object-contain mix-blend-multiply sm:scale-95 lg:scale-[0.9] xl:scale-95 ${shortcut.imageClassName || ''}`}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3 lg:gap-2.5">
                    <div className={`h-7 w-1.5 rounded-full bg-gradient-to-b sm:h-8 lg:h-7 ${shortcut.accent}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-semibold leading-tight text-slate-800 sm:text-[12px] lg:text-[11px] xl:text-[12px]">{shortcut.label}</p>
                      {shortcut.hint && (
                        <p className="mt-0.5 hidden text-[10px] font-medium text-slate-500 sm:block lg:text-[9px] xl:text-[10px]">{shortcut.hint}</p>
                      )}
                    </div>
                    {shortcut.combo && (
                      <span className="hidden rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-sky-700 sm:inline-flex lg:px-2 lg:text-[9px] xl:px-2.5 xl:text-[10px]">
                        {shortcut.combo}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowExtraShortcuts((current) => !current)}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-100 transition hover:bg-white/12 sm:rounded-2xl"
          >
            <span>{showExtraShortcuts ? 'Hide More' : 'Show More'}</span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className={`h-4 w-4 transition-transform ${showExtraShortcuts ? 'rotate-180' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m5 7 5 5 5-5" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
