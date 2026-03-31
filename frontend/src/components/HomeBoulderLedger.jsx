import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Scale, Truck } from 'lucide-react';
import apiClient from '../utils/api';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const formatDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const parseWeightFromMethod = (method, label) => {
  const match = String(method || '').match(new RegExp(`${label}\\s+(\\d+(?:\\.\\d+)?)`, 'i'));
  return match ? Number(match[1]) : 0;
};

const normalizeFallbackEntry = (entry) => ({
  _id: entry.refId || `${entry.voucherNumber}-${entry.date}`,
  boulderDate: entry.date || entry.entryCreatedAt,
  createdAt: entry.entryCreatedAt || entry.date,
  vehicleNo: entry.voucherNumber || entry.partyName || '-',
  grossWeight: parseWeightFromMethod(entry.method, 'Gross'),
  tareWeight: parseWeightFromMethod(entry.method, 'Tare'),
  netWeight: parseWeightFromMethod(entry.method, 'Net'),
  slipImg: ''
});

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

export default function HomeBoulderLedger() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBoulders = async () => {
      try {
        setLoading(true);
        let response;

        try {
          response = await apiClient.get('/boulders');
          setEntries(Array.isArray(response) ? response : []);
        } catch (routeError) {
          if (routeError?.message !== 'Cannot GET /api/boulders' && routeError?.status !== 404) {
            throw routeError;
          }

          const fallbackResponse = await apiClient.get('/reports/day-book');
          const fallbackEntries = Array.isArray(fallbackResponse?.entries)
            ? fallbackResponse.entries
                .filter((item) => item.type === 'boulder')
                .map(normalizeFallbackEntry)
            : [];

          setEntries(fallbackEntries);
        }
        setError('');
      } catch (err) {
        setError(err.message || 'Unable to load boulder ledger');
      } finally {
        setLoading(false);
      }
    };

    loadBoulders();
  }, []);

  const sortedEntries = useMemo(() => (
    [...entries].sort((a, b) => {
      const aTime = new Date(a.boulderDate || a.createdAt).getTime() || 0;
      const bTime = new Date(b.boulderDate || b.createdAt).getTime() || 0;
      return bTime - aTime;
    })
  ), [entries]);

  const summary = useMemo(() => sortedEntries.reduce((acc, entry) => ({
    count: acc.count + 1,
    grossWeight: acc.grossWeight + Number(entry.grossWeight || 0),
    tareWeight: acc.tareWeight + Number(entry.tareWeight || 0),
    netWeight: acc.netWeight + Number(entry.netWeight || 0)
  }), {
    count: 0,
    grossWeight: 0,
    tareWeight: 0,
    netWeight: 0
  }), [sortedEntries]);

  const recentEntries = sortedEntries.slice(0, 8);

  return (
    <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-2.5 xl:gap-3">
        <StatCard title="Entries" value={formatNumber(summary.count)} subtitle="recent boulder slips" icon={Truck} tone="from-sky-500 to-cyan-500" />
        <StatCard title="Gross Weight" value={formatNumber(summary.grossWeight)} subtitle="total gross kg" icon={Scale} tone="from-indigo-500 to-blue-500" />
        <StatCard title="Tare Weight" value={formatNumber(summary.tareWeight)} subtitle="total tare kg" icon={CalendarDays} tone="from-amber-500 to-orange-500" />
        <StatCard title="Net Weight" value={formatNumber(summary.netWeight)} subtitle="total net kg" icon={Truck} tone="from-emerald-500 to-teal-500" />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm font-medium text-slate-500">Loading boulder ledger...</div>
        ) : recentEntries.length > 0 ? (
          <>
            <div className="space-y-3 p-3 lg:hidden">
              {recentEntries.map((entry) => (
                <div key={entry._id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{entry.vehicleNo || '-'}</p>
                      <p className="text-xs text-slate-500">{formatDate(entry.boulderDate || entry.createdAt)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-3">
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Gross</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatNumber(entry.grossWeight)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Tare</p><p className="mt-1 text-sm font-semibold text-slate-800">{formatNumber(entry.tareWeight)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Net</p><p className="mt-1 text-sm font-bold text-emerald-600">{formatNumber(entry.netWeight)}</p></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[700px] table-fixed xl:min-w-[860px]">
              <colgroup>
                <col className="w-[16%] lg:w-[17%]" />
                <col className="w-[22%] lg:w-[21%]" />
                <col className="w-[15%] lg:w-[15%]" />
                <col className="w-[15%] lg:w-[15%]" />
                <col className="w-[15%] lg:w-[15%]" />
                <col className="w-[17%] lg:w-[17%]" />
              </colgroup>
              <thead>
                <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Vehicle No</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Gross</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Tare</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Net</th>
                  <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] lg:px-2.5 lg:py-2 lg:text-[10px] xl:px-4 xl:py-3 xl:text-xs">Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentEntries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">
                      {formatDate(entry.boulderDate || entry.createdAt)}
                    </td>
                    <td className="px-4 py-3 lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                      <div className="flex items-center gap-3 lg:gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white lg:h-7 lg:w-7 xl:h-9 xl:w-9">
                          <Truck className="h-4 w-4 lg:h-3 lg:w-3 xl:h-4 xl:w-4" />
                        </div>
                        <span className="truncate text-sm font-semibold text-slate-800 lg:text-[12px] xl:text-sm">{entry.vehicleNo || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatNumber(entry.grossWeight)}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-slate-700 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatNumber(entry.tareWeight)}</td>
                    <td className="px-4 py-3 text-right text-sm font-black text-emerald-600 lg:px-2.5 lg:py-2 lg:text-[12px] xl:px-4 xl:py-3 xl:text-sm">{formatNumber(entry.netWeight)}</td>
                    <td className="px-4 py-3 text-center lg:px-2.5 lg:py-2 xl:px-4 xl:py-3">
                      {entry.slipImg ? (
                        <a
                          href={entry.slipImg}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700 transition hover:bg-sky-100 lg:px-1.5 lg:py-0.5 lg:text-[10px] xl:px-2.5 xl:py-1 xl:text-xs"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 lg:text-[10px] xl:text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center px-4 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <Truck className="h-7 w-7 text-slate-400" />
            </div>
            <p className="mt-4 text-base font-semibold text-slate-700">No boulder entries found</p>
            <p className="mt-1 text-sm text-slate-500">New boulder slips will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
