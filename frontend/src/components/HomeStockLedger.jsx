import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Search, TrendingDown, TrendingUp } from 'lucide-react';
import apiClient from '../utils/api';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const formatCurrency = (value) => (
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
);

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

export default function HomeStockLedger() {
  const navigate = useNavigate();
  const [stockLedger, setStockLedger] = useState({ ledger: [], currentStock: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStockLedger = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/reports/stock-ledger');
        setStockLedger(response || { ledger: [], currentStock: [] });
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load stock ledger');
      } finally {
        setLoading(false);
      }
    };

    loadStockLedger();
  }, []);

  const stockRows = stockLedger?.currentStock || [];
  const ledgerRows = stockLedger?.ledger || [];

  const filteredStockRows = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return stockRows;

    return stockRows.filter((row) => (
      String(row.productName || '').toLowerCase().includes(term)
    ));
  }, [searchTerm, stockRows]);

  const filteredLedgerRows = useMemo(() => {
    const term = String(searchTerm || '').trim().toLowerCase();
    if (!term) return ledgerRows;

    return ledgerRows.filter((row) => (
      [row.productName, row.partyName, row.refNumber, row.displayType]
        .some((value) => String(value || '').toLowerCase().includes(term))
    ));
  }, [ledgerRows, searchTerm]);

  const summary = useMemo(() => filteredLedgerRows.reduce((acc, row) => ({
    movements: acc.movements + 1,
    totalIn: acc.totalIn + Number(row.inQty || 0),
    totalOut: acc.totalOut + Number(row.outQty || 0)
  }), {
    movements: 0,
    totalIn: 0,
    totalOut: 0
  }), [filteredLedgerRows]);

  const totalAvailable = useMemo(
    () => filteredStockRows.reduce((sum, row) => sum + Number(row.currentStock || 0), 0),
    [filteredStockRows]
  );

  const recentRows = filteredLedgerRows
    .slice()
    .sort((firstRow, secondRow) => {
      const firstTime = new Date(firstRow.entryCreatedAt || firstRow.date).getTime() || 0;
      const secondTime = new Date(secondRow.entryCreatedAt || secondRow.date).getTime() || 0;
      return secondTime - firstTime;
    })
    .slice(0, 8);

  const handleOpenStock = (productId) => {
    if (!productId) return;
    navigate(`/stock/${productId}`);
  };

  return (
    <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-2.5 xl:gap-3">
        <StatCard title="Stocks" value={formatNumber(filteredStockRows.length)} subtitle="tracked items" icon={Boxes} tone="from-sky-500 to-cyan-500" />
        <StatCard title="Available" value={formatNumber(totalAvailable)} subtitle="current stock" icon={TrendingUp} tone="from-emerald-500 to-teal-500" />
        <StatCard title="Purchased" value={formatNumber(summary.totalIn)} subtitle="stock in qty" icon={TrendingUp} tone="from-blue-500 to-indigo-500" />
        <StatCard title="Used" value={formatNumber(summary.totalOut)} subtitle="stock out qty" icon={TrendingDown} tone="from-rose-500 to-pink-500" />
        <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_16px_30px_rgba(15,23,42,0.08)] lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 lg:text-[9px] xl:text-[10px]">Search</label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Stock or vehicle..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 lg:py-1.5 lg:pl-8 lg:text-[13px] xl:py-2 xl:pl-9 xl:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[0.24fr_minmax(0,1fr)] lg:gap-4 xl:grid-cols-[0.22fr_minmax(0,1fr)] xl:gap-5">
        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 lg:text-[11px] xl:text-sm">Current Stock</h3>
            <p className="text-xs text-slate-500 lg:text-[10px] xl:text-xs">Click any stock item to open full history</p>
          </div>
          {loading ? (
            <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 lg:px-3 lg:py-10 lg:text-[13px] xl:px-4 xl:py-12 xl:text-sm">Loading stock ledger...</div>
          ) : filteredStockRows.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredStockRows.slice(0, 10).map((row) => (
                <button
                  key={String(row.productId)}
                  type="button"
                  onClick={() => handleOpenStock(row.productId)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-slate-50 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 lg:text-[12px] xl:text-sm">{row.productName || '-'}</p>
                    <p className="text-xs text-slate-500 lg:text-[10px] xl:text-xs">Unit: {row.unit || '-'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-emerald-600 lg:text-[13px] xl:text-base">{formatNumber(row.currentStock)}</p>
                    <p className="text-[11px] text-slate-400 lg:text-[10px] xl:text-[11px]">available</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 lg:px-3 lg:py-10 lg:text-[13px] xl:px-4 xl:py-12 xl:text-sm">No stock items found</div>
          )}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 lg:text-[11px] xl:text-sm">Recent Stock History</h3>
            <p className="text-xs text-slate-500 lg:text-[10px] xl:text-xs">Purchase rate and material usage movement</p>
          </div>
          {loading ? (
            <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 lg:px-3 lg:py-10 lg:text-[13px] xl:px-4 xl:py-12 xl:text-sm">Loading stock history...</div>
          ) : recentRows.length > 0 ? (
            <>
              <div className="space-y-3 p-3 lg:hidden">
                {recentRows.map((row) => (
                  <div key={row.refId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                    <div className="bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 p-3">
                      <p className="text-sm font-bold text-slate-900">{row.productName || '-'}</p>
                      <p className="text-xs text-slate-500">{formatDate(row.date)} • {row.displayType || row.type || '-'}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-3">
                      <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Party / Vehicle</p><p className="mt-1 text-sm text-slate-800">{row.partyName || '-'}</p></div>
                      <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Rate</p><p className="mt-1 text-sm font-semibold text-slate-800">{Number(row.rate || 0) > 0 ? formatCurrency(row.rate) : '-'}</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-3">
                      <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">In Qty</p><p className="mt-1 text-sm font-bold text-emerald-600">{Number(row.inQty || 0) > 0 ? formatNumber(row.inQty) : '-'}</p></div>
                      <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Out Qty</p><p className="mt-1 text-sm font-bold text-rose-600">{Number(row.outQty || 0) > 0 ? formatNumber(row.outQty) : '-'}</p></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[760px] xl:min-w-[860px]">
                <thead>
                  <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Party / Vehicle</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">In</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Out</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-1.5 lg:py-1.5 lg:text-[9px] xl:px-4 xl:py-3 xl:text-xs">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentRows.map((row) => (
                    <tr key={row.refId} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 text-sm text-slate-800 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{row.productName || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{row.displayType || row.type || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{row.partyName || '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{Number(row.inQty || 0) > 0 ? formatNumber(row.inQty) : '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{Number(row.outQty || 0) > 0 ? formatNumber(row.outQty) : '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800 lg:px-1.5 lg:py-1.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-sm">{Number(row.rate || 0) > 0 ? formatCurrency(row.rate) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
            </table>
              </div>
            </>
          ) : (
            <div className="px-4 py-12 text-center text-sm font-medium text-slate-500 lg:px-3 lg:py-10 lg:text-[13px] xl:px-4 xl:py-12 xl:text-sm">No stock history found</div>
          )}
        </div>
      </div>
    </div>
  );
}
