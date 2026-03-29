import { useEffect, useMemo, useState } from 'react';
import { Layers3, ReceiptText, ShoppingBag, Wallet } from 'lucide-react';
import apiClient from '../utils/api';

const formatCurrency = (value) => (
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getExpenseKind = (expense) => (Array.isArray(expense?.items) && expense.items.length > 0 ? 'purchase' : 'normal');

const getExpenseItemSummary = (expense) => {
  if (!Array.isArray(expense?.items) || expense.items.length === 0) return expense?.expenseGroup?.name || '-';

  return expense.items
    .map((item) => item.expenseGroupName || item.expenseGroup?.name || 'Item')
    .filter(Boolean)
    .join(', ');
};

const getExpenseQuantitySummary = (expense) => {
  if (!Array.isArray(expense?.items) || expense.items.length === 0) return '-';

  return expense.items
    .map((item) => {
      const quantity = Number(item.quantity || 0);
      const unit = String(item.unit || '').trim();
      if (quantity <= 0) return '';
      return `${quantity}${unit ? ` ${unit}` : ''}`;
    })
    .filter(Boolean)
    .join(', ') || '-';
};

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_16px_30px_rgba(15,23,42,0.08)] lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 lg:text-[9px] xl:text-[10px]">{title}</p>
          <p className="mt-1 text-lg font-black text-slate-800 lg:text-base xl:text-lg">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500 lg:text-[11px] xl:text-xs">{subtitle}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-2 text-white lg:p-1.5 xl:p-2 ${tone}`}>
          <Icon className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
        </div>
      </div>
    </div>
  );
}

export default function HomeExpenseLedger() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/expenses');
        setExpenses(response?.data || []);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load expense ledger');
      } finally {
        setLoading(false);
      }
    };

    loadExpenses();
  }, []);

  const sortedExpenses = useMemo(() => (
    [...expenses].sort((a, b) => {
      const aTime = new Date(a.expenseDate || a.createdAt).getTime() || 0;
      const bTime = new Date(b.expenseDate || b.createdAt).getTime() || 0;
      return bTime - aTime;
    })
  ), [expenses]);

  const summary = useMemo(() => sortedExpenses.reduce((acc, expense) => {
    const amount = Number(expense.amount || 0);
    const kind = getExpenseKind(expense);

    acc.count += 1;
    acc.totalAmount += amount;
    if (kind === 'purchase') {
      acc.purchaseAmount += amount;
    } else {
      acc.normalAmount += amount;
    }

    return acc;
  }, {
    count: 0,
    totalAmount: 0,
    normalAmount: 0,
    purchaseAmount: 0
  }), [sortedExpenses]);

  const recentExpenses = sortedExpenses.slice(0, 8);

  return (
    <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2.5 xl:gap-3">
        <StatCard title="Entries" value={summary.count} subtitle="all expense vouchers" icon={ReceiptText} tone="from-sky-500 to-cyan-500" />
        <StatCard title="Total Expense" value={formatCurrency(summary.totalAmount)} subtitle="combined amount" icon={Wallet} tone="from-rose-500 to-pink-500" />
        <StatCard title="Normal Expense" value={formatCurrency(summary.normalAmount)} subtitle="service and regular" icon={Layers3} tone="from-violet-500 to-fuchsia-500" />
        <StatCard title="Purchase Expense" value={formatCurrency(summary.purchaseAmount)} subtitle="goods and stock use" icon={ShoppingBag} tone="from-amber-500 to-orange-500" />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm font-medium text-slate-500">Loading expense ledger...</div>
        ) : recentExpenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] table-fixed xl:min-w-[920px]">
              <colgroup>
                <col className="w-[13%]" />
                <col className="w-[11%]" />
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-[8%]" />
                <col className="w-[8%]" />
              </colgroup>
              <thead>
                <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Ref</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Group / Items</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Party</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Method</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExpenses.map((expense) => {
                  const kind = getExpenseKind(expense);

                  return (
                    <tr key={expense._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatDate(expense.expenseDate || expense.createdAt)}</td>
                      <td className="truncate px-4 py-3 text-xs font-semibold text-slate-700 lg:px-2 lg:py-2 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">{expense.expenseNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{getExpenseItemSummary(expense)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{kind === 'purchase' ? getExpenseQuantitySummary(expense) : '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{expense.party?.name || '-'}</td>
                      <td className="px-4 py-3 text-center lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold lg:px-1.5 lg:py-0.5 lg:text-[10px] xl:px-2.5 xl:py-1 xl:text-xs ${
                          kind === 'purchase'
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'border border-violet-200 bg-violet-50 text-violet-700'
                        }`}>
                          {kind === 'purchase' ? 'Purchase Expense' : 'Normal Expense'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                        <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700 lg:px-1.5 lg:py-0.5 lg:text-[10px] xl:px-2.5 xl:py-1 xl:text-xs">
                          {expense.method || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatCurrency(expense.amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Wallet className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No expenses found</p>
            <p className="mt-1 text-sm text-slate-500">Normal and purchase expenses will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
