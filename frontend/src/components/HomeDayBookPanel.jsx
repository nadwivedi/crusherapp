import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownCircle, ArrowUpCircle, Banknote, BookText, Package, TrendingUp, BarChart2 } from 'lucide-react';
import apiClient from '../utils/api';
import HomePartyLedger from './HomePartyLedger';
import HomeExpenseLedger from './HomeExpenseLedger';
import HomeMaterialUsedLedger from './HomeMaterialUsedLedger';
import HomeStockLedger from './HomeStockLedger';

const DEFAULT_SUMMARY = {
  entryCount: 0,
  totalInward: 0,
  totalOutward: 0,
  boulderQty: 0,
  sales: 0,
  purchases: 0,
  receipts: 0,
  payments: 0,
  expenses: 0
};

const getTodayInput = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatCurrency = (value) => (
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
);

const formatNumber = (value) => (
  Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const parseWeightFromMethod = (method, label) => {
  const match = String(method || '').match(new RegExp(`${label}\\s+(\\d+(?:\\.\\d+)?)`, 'i'));
  return match ? Number(match[1]) : 0;
};

const buildSummary = (entries) => entries.reduce((acc, entry) => {
  const amount = Number(entry.amount || 0);
  const inward = Number(entry.inAmount || 0);
  const outward = Number(entry.outAmount || 0);

  acc.entryCount += 1;
  acc.totalInward += inward;
  acc.totalOutward += outward;

  if (entry.type === 'boulder') {
    acc.boulderQty += parseWeightFromMethod(entry.method, 'Net');
  }
  if (entry.type === 'sale') acc.sales += amount;
  if (entry.type === 'purchase') acc.purchases += amount;
  if (entry.type === 'receipt') acc.receipts += amount;
  if (entry.type === 'payment') acc.payments += amount;
  if (entry.type === 'expense') acc.expenses += amount;

  return acc;
}, { ...DEFAULT_SUMMARY });

const TYPE_BADGE_STYLES = {
  sale: 'bg-blue-100 text-blue-700',
  payment: 'bg-rose-100 text-rose-700',
  receipt: 'bg-emerald-100 text-emerald-700',
  purchase: 'bg-amber-100 text-amber-700',
  expense: 'bg-fuchsia-100 text-fuchsia-700',
};
const getEntryTypeLabel = (entry) => String(entry?.displayType || entry?.type || '-');

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-[0_16px_30px_rgba(15,23,42,0.08)] lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500 lg:text-[8px] xl:text-[10px]">{title}</p>
          <p className="mt-1 text-[13px] font-black text-slate-800 lg:text-[14px] xl:text-lg">{value}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-1.5 text-white lg:p-1.5 xl:p-2 ${tone}`}>
          <Icon className="h-3.5 w-3.5 lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
        </div>
      </div>
    </div>
  );
}

export default function HomeDayBookPanel() {
  const navigate = useNavigate();
  const today = useMemo(() => getTodayInput(), []);
  const [activeView, setActiveView] = useState('daybook');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDayBook = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/reports/day-book', {
          params: {
            fromDate: today,
            toDate: today
          }
        });
        setEntries(response?.entries || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load day book');
      } finally {
        setLoading(false);
      }
    };

    loadDayBook();
  }, [today]);

  const sortedEntries = useMemo(() => (
    [...entries].sort((a, b) => {
      const aTime = new Date(a.entryCreatedAt || a.date).getTime() || 0;
      const bTime = new Date(b.entryCreatedAt || b.date).getTime() || 0;
      return bTime - aTime;
    })
  ), [entries]);

  const summary = useMemo(() => buildSummary(sortedEntries), [sortedEntries]);
  const recentEntries = sortedEntries.slice(0, 8);

  return (
    <section className="w-full rounded-[28px] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,245,249,0.96))] shadow-[0_28px_70px_rgba(15,23,42,0.18)] lg:rounded-[24px] xl:rounded-[28px]">
      <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6 lg:px-4 lg:py-4 xl:px-6 xl:py-5">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveView('party-ledger')}
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
              onClick={() => setActiveView('daybook')}
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
              onClick={() => setActiveView('expense-ledger')}
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
              onClick={() => setActiveView('material-used-ledger')}
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
              onClick={() => setActiveView('stock-ledger')}
            className={`inline-flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition lg:px-2.5 lg:py-1.5 lg:text-[11px] xl:px-3 xl:py-2 xl:text-xs ${
              activeView === 'stock-ledger'
                ? 'border-indigo-300 bg-indigo-100 text-indigo-800'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            Stock Ledger
          </button>
          
          <div className="hidden flex-1 min-w-[20px] lg:block"></div>
          
          <button
            type="button"
            onClick={() => navigate('/analytics')}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-slate-700 shadow-sm"
          >
            <BarChart2 className="w-3.5 h-3.5" /> View Analytics
          </button>
        </div>
      </div>

      {activeView === 'party-ledger' ? (
        <HomePartyLedger />
      ) : activeView === 'expense-ledger' ? (
        <HomeExpenseLedger />
      ) : activeView === 'material-used-ledger' ? (
        <HomeMaterialUsedLedger />
      ) : activeView === 'stock-ledger' ? (
        <HomeStockLedger />
      ) : (
      <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-2.5 xl:gap-3">
          <StatCard title="Sales" value={formatCurrency(summary.sales)} icon={TrendingUp} tone="from-emerald-500 to-teal-500" />
          <StatCard title="Boulder" value={`${formatNumber((summary.boulderQty || 0) / 1000)} TONS`} icon={Package} tone="from-rose-500 to-pink-500" />
          <StatCard title="Receipts" value={formatCurrency(summary.receipts)} icon={ArrowDownCircle} tone="from-sky-500 to-cyan-500" />
          <StatCard title="Payments" value={formatCurrency(summary.payments)} icon={ArrowUpCircle} tone="from-amber-500 to-orange-500" />
          <StatCard title="Expenses" value={formatCurrency(summary.expenses)} icon={Banknote} tone="from-fuchsia-500 to-violet-500" />
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
          {loading ? (
            <div className="px-4 py-12 text-center text-sm font-medium text-slate-500">Loading day book...</div>
          ) : recentEntries.length > 0 ? (
            <>
              <div className="p-3 space-y-3 lg:hidden">
                {recentEntries.map((entry, index) => {
                  const typeBadgeClass = TYPE_BADGE_STYLES[entry.type] || 'bg-slate-100 text-slate-700';
                  const materialPrimary = entry.type === 'boulder'
                    ? 'Boulder'
                    : (String(entry.materialSummary || '').split('/')[0]?.trim() || '-');
                  const materialSecondary = entry.type === 'boulder'
                    ? (parseWeightFromMethod(entry.method, 'Net') > 0 ? `${parseWeightFromMethod(entry.method, 'Net')} kg` : '-')
                    : (String(entry.materialSummary || '').split('/')[1]?.trim() || '-');

                  return (
                    <div
                      key={`${entry.refId || entry.voucherNumber || entry.type}-${index}`}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 p-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900">{entry.partyName || 'No Party'}</p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">{entry.voucherNumber || '-'}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${typeBadgeClass}`}>
                          {getEntryTypeLabel(entry)}
                        </span>
                      </div>

                      <div className="space-y-3 p-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Date</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(entry.entryCreatedAt || entry.date)}</p>
                            <p className="text-xs text-slate-500">{formatTime(entry.entryCreatedAt || entry.date)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Material</p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">{materialPrimary}</p>
                            <p className="text-xs text-slate-500">{materialSecondary}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">In Amount</p>
                            <p className="mt-1 text-sm font-bold text-emerald-600">
                              {Number(entry.inAmount || 0) > 0 ? formatCurrency(entry.inAmount) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Out Amount</p>
                            <p className="mt-1 text-sm font-bold text-rose-600">
                              {Number(entry.outAmount || 0) > 0 ? formatCurrency(entry.outAmount) : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[840px] xl:min-w-[940px]">
                <thead>
                  <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Party</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Material</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">In</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEntries.map((entry, index) => {
                    const typeBadgeClass = TYPE_BADGE_STYLES[entry.type] || 'bg-slate-100 text-slate-700';

                    return (
                    <tr key={`${entry.refId || entry.voucherNumber || entry.type}-${index}`} className="hover:bg-slate-50">
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 lg:text-[13px] xl:text-sm">{formatDate(entry.entryCreatedAt || entry.date)}</p>
                          <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">{formatTime(entry.entryCreatedAt || entry.date)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize lg:px-2 lg:py-0.5 lg:text-[11px] xl:px-2.5 xl:py-1 xl:text-xs ${typeBadgeClass}`}>
                          {getEntryTypeLabel(entry)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700 lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">{entry.voucherNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm">{entry.partyName || '-'}</td>
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        {entry.type === 'boulder' ? (
                          <div>
                            <p className="text-sm text-slate-700 lg:text-[13px] xl:text-sm">Boulder</p>
                            <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">
                              {parseWeightFromMethod(entry.method, 'Net') > 0 ? `${parseWeightFromMethod(entry.method, 'Net')} kg` : '-'}
                            </p>
                          </div>
                        ) : entry.materialSummary && entry.materialSummary !== '-' ? (
                          <div>
                            <p className="text-sm text-slate-700 lg:text-[13px] xl:text-sm">{String(entry.materialSummary).split('/')[0]?.trim() || '-'}</p>
                            <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">{String(entry.materialSummary).split('/')[1]?.trim() || '-'}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-700 lg:text-[13px] xl:text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm">
                        {Number(entry.inAmount || 0) > 0 ? formatCurrency(entry.inAmount) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600 lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm">
                        {Number(entry.outAmount || 0) > 0 ? formatCurrency(entry.outAmount) : '-'}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <div className="rounded-full bg-slate-100 p-4">
                <BookText className="h-7 w-7 text-slate-400" />
              </div>
              <p className="mt-4 text-base font-semibold text-slate-700">No day book entries for today</p>
              <p className="mt-1 text-sm text-slate-500">New vouchers created today will appear here automatically.</p>
            </div>
          )}
        </div>
      </div>
      )}
    </section>
  );
}
