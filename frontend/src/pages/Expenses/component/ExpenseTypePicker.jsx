export default function ExpenseTypePicker({ open, onClose, onChooseType }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-[1.5px] md:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-white/15 bg-gradient-to-r from-cyan-700 via-blue-700 to-indigo-700 px-4 py-3 text-white">
          <h2 className="text-lg font-bold">Choose Expense Type</h2>
          <p className="mt-1 text-xs text-cyan-100">Select what kind of expense you want to enter.</p>
        </div>
        <div className="space-y-3 p-4">
          <button
            type="button"
            onClick={() => onChooseType('normal')}
            className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
          >
            <div>
              <p className="font-semibold text-slate-900">Normal Expense</p>
              <p className="text-xs text-slate-500">Services and regular expense groups.</p>
            </div>
            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">Services</span>
          </button>
          <button
            type="button"
            onClick={() => onChooseType('purchase')}
            className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left transition hover:bg-emerald-100"
          >
            <div>
              <p className="font-semibold text-slate-900">Purchase Expense</p>
              <p className="text-xs text-slate-500">Goods expense with multiple stock items.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Goods</span>
          </button>
        </div>
      </div>
    </div>
  );
}
