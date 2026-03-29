import { useEffect, useMemo, useState } from 'react';
import { IndianRupee, ReceiptText, ShoppingCart, Truck } from 'lucide-react';
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

const formatSaleTypeLabel = (value) => {
  if (value === 'cash sale') return 'Cash Sale';
  if (value === 'credit sale') return 'Credit Sale';
  return 'Sale';
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

export default function HomeSalesLedger() {
  const [sales, setSales] = useState([]);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSales = async () => {
      try {
        setLoading(true);
        const [salesRes, partiesRes] = await Promise.all([
          apiClient.get('/sales'),
          apiClient.get('/parties')
        ]);
        setSales(Array.isArray(salesRes) ? salesRes : []);
        setParties(Array.isArray(partiesRes) ? partiesRes : []);
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load sales ledger');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, []);

  const partyMap = useMemo(() => new Map(
    parties.map((party) => [String(party._id), party.name || 'Unknown'])
  ), [parties]);

  const sortedSales = useMemo(() => (
    [...sales].sort((a, b) => {
      const aTime = new Date(a.saleDate || a.createdAt).getTime() || 0;
      const bTime = new Date(b.saleDate || b.createdAt).getTime() || 0;
      return bTime - aTime;
    })
  ), [sales]);

  const summary = useMemo(() => sortedSales.reduce((acc, sale) => ({
    count: acc.count + 1,
    totalAmount: acc.totalAmount + Number(sale.totalAmount || 0),
    paidAmount: acc.paidAmount + Number(sale.paidAmount || 0),
    dueAmount: acc.dueAmount + Math.max(0, Number(sale.totalAmount || 0) - Number(sale.paidAmount || 0))
  }), {
    count: 0,
    totalAmount: 0,
    paidAmount: 0,
    dueAmount: 0
  }), [sortedSales]);

  const recentSales = sortedSales.slice(0, 8);

  return (
    <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2.5 xl:gap-3">
        <StatCard title="Invoices" value={summary.count} subtitle="total sales entries" icon={ReceiptText} tone="from-sky-500 to-cyan-500" />
        <StatCard title="Total Sale" value={formatCurrency(summary.totalAmount)} subtitle="billed amount" icon={ShoppingCart} tone="from-emerald-500 to-teal-500" />
        <StatCard title="Paid" value={formatCurrency(summary.paidAmount)} subtitle="received amount" icon={IndianRupee} tone="from-violet-500 to-fuchsia-500" />
        <StatCard title="Due" value={formatCurrency(summary.dueAmount)} subtitle="pending amount" icon={Truck} tone="from-amber-500 to-orange-500" />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm font-medium text-slate-500">Loading sales ledger...</div>
        ) : recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] xl:min-w-[980px]">
              <thead>
                <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Party</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Vehicle</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Material</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Date</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Paid</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map((sale) => {
                  const partyName = partyMap.get(String(sale.partyId || sale.party)) || sale.customerName || '-';

                  return (
                    <tr key={sale._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{sale.invoiceNumber || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{partyName}</td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{sale.vehicleNo || '-'}</td>
                      <td className="px-4 py-3 lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                        {sale.materialType ? (
                          <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 lg:px-1.5 lg:py-0.5 lg:text-[10px] xl:px-2.5 xl:py-1 xl:text-xs">
                            {String(sale.materialType).toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-700 lg:text-[12px] xl:text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatDate(sale.saleDate || sale.createdAt)}</td>
                      <td className="px-4 py-3 text-center lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold lg:px-1.5 lg:py-0.5 lg:text-[10px] xl:px-2.5 xl:py-1 xl:text-xs ${
                          sale.type === 'cash sale'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : sale.type === 'sale'
                              ? 'border border-amber-200 bg-amber-50 text-amber-700'
                              : 'border border-rose-200 bg-rose-50 text-rose-700'
                        }`}>
                          {formatSaleTypeLabel(sale.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-sky-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatCurrency(sale.paidAmount)}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatCurrency(sale.totalAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <ShoppingCart className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No sales found</p>
            <p className="mt-1 text-sm text-slate-500">Recent sales entries will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
