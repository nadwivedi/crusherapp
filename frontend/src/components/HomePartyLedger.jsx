import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingDown, TrendingUp, Users } from 'lucide-react';
import apiClient from '../utils/api';

const formatCurrency = (value) => (
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
);

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

export default function HomePartyLedger() {
  const navigate = useNavigate();
  const [parties, setParties] = useState([]);
  const [outstanding, setOutstanding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState('all');

  useEffect(() => {
    const loadParties = async () => {
      setLoading(true);
      setError('');
      try {
        const [partiesRes, outstandingRes] = await Promise.all([
          apiClient.get('/parties'),
          apiClient.get('/reports/outstanding')
        ]);
        setParties(Array.isArray(partiesRes) ? partiesRes : []);
        setOutstanding(outstandingRes || null);
      } catch (err) {
        setError(err.message || 'Error loading parties');
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, []);

  const partySummary = useMemo(() => {
    if (!outstanding?.partyOutstanding) return [];
    const partyOutstanding = outstanding.partyOutstanding;

    return parties.map((party) => {
      const outstandingData = partyOutstanding.find((item) => String(item.partyId) === String(party._id));
      return {
        ...party,
        receivable: outstandingData?.receivable || 0,
        payable: outstandingData?.payable || 0,
        netBalance: (outstandingData?.receivable || 0) - (outstandingData?.payable || 0)
      };
    });
  }, [outstanding, parties]);

  const filteredParties = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return partySummary
      .filter((party) => {
        const matchesSearch = !searchTerm || (
          (party.name || '').toLowerCase().includes(term)
          || (party.mobile || '').includes(term)
          || (party.email || '').toLowerCase().includes(term)
        );

        if (!matchesSearch) return false;
        if (balanceFilter === 'receivable') return Number(party.receivable || 0) > 0;
        if (balanceFilter === 'payable') return Number(party.payable || 0) > 0;
        return true;
      })
      .sort((a, b) => {
        if (balanceFilter === 'receivable') return Number(b.receivable || 0) - Number(a.receivable || 0);
        if (balanceFilter === 'payable') return Number(b.payable || 0) - Number(a.payable || 0);
        return (a.name || '').localeCompare(b.name || '');
      });
  }, [balanceFilter, partySummary, searchTerm]);

  const totalReceivable = useMemo(
    () => partySummary.reduce((sum, party) => sum + Number(party.receivable || 0), 0),
    [partySummary]
  );

  const totalPayable = useMemo(
    () => partySummary.reduce((sum, party) => sum + Number(party.payable || 0), 0),
    [partySummary]
  );

  const handlePartyClick = (party) => {
    navigate(`/party/${party._id}`);
  };

  return (
    <div className="space-y-5 p-5 sm:p-6 lg:space-y-4 lg:p-4 xl:space-y-5 xl:p-6">
      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-2.5 xl:gap-3">
        <StatCard title="Total Parties" value={parties.length} subtitle="registered parties" icon={Users} tone="from-blue-500 to-cyan-500" />
        <StatCard title="Receivable" value={formatCurrency(totalReceivable)} subtitle="to receive" icon={TrendingUp} tone="from-emerald-500 to-teal-500" />
        <StatCard title="Payable" value={formatCurrency(totalPayable)} subtitle="to pay" icon={TrendingDown} tone="from-rose-500 to-pink-500" />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white lg:rounded-[20px] xl:rounded-[24px]">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-700 lg:text-[13px] xl:text-sm">Party Ledger</h3>
            <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">Outstanding summary for all parties</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={balanceFilter}
              onChange={(event) => setBalanceFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 lg:px-2.5 lg:py-1.5 lg:text-[13px] xl:px-3 xl:py-2 xl:text-sm"
            >
              <option value="all">All Balances</option>
              <option value="receivable">Receivable</option>
              <option value="payable">Payable</option>
            </select>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search party..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 sm:w-60 lg:py-1.5 lg:pl-8 lg:text-[13px] xl:py-2 xl:pl-9 xl:text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-12 text-center text-sm font-medium text-slate-500">Loading party ledger...</div>
        ) : (
          <>
            <div className="space-y-3 p-3 lg:hidden">
              {filteredParties.length > 0 ? (
                filteredParties.map((party) => (
                  <button
                    key={party._id}
                    type="button"
                    onClick={() => handlePartyClick(party)}
                    className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-3 bg-gradient-to-r from-sky-50 via-cyan-50 to-blue-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-bold text-white">
                          {(party.name || 'P').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">{party.name || 'Unknown'}</p>
                          <p className="truncate text-xs text-slate-500">{party.email || '-'}</p>
                        </div>
                      </div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        party.type === 'customer'
                          ? 'bg-amber-100 text-amber-700'
                          : party.type === 'supplier'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-cyan-100 text-cyan-700'
                      }`}>
                        {party.type === 'customer' ? 'Customer' : party.type === 'supplier' ? 'Supplier' : 'Cash'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Mobile</p>
                        <p className="mt-1 text-sm font-semibold text-slate-800">{party.mobile || '-'}</p>
                        <p className="text-xs text-slate-500">{party.state || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Net Balance</p>
                        <p className={`mt-1 text-sm font-bold ${(party.netBalance || 0) >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>{formatCurrency(party.netBalance || 0)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-3">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Receivable</p>
                        <p className="mt-1 text-sm font-bold text-emerald-600">{party.receivable > 0 ? formatCurrency(party.receivable) : '-'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Payable</p>
                        <p className="mt-1 text-sm font-bold text-rose-600">{party.payable > 0 ? formatCurrency(party.payable) : '-'}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-10 text-center text-sm text-slate-500">No parties found</div>
              )}
            </div>

            <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr className="bg-[linear-gradient(135deg,#0f766e_0%,#0d9488_38%,#0891b2_72%,#0284c7_100%)] text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Party</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Contact</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Receivable</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Payable</th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-[0.14em] lg:px-3 lg:py-2.5 lg:text-[11px] xl:px-4 xl:py-3 xl:text-xs">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParties.length > 0 ? (
                  filteredParties.map((party) => (
                    <tr
                      key={party._id}
                      onClick={() => handlePartyClick(party)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-sm font-bold text-white lg:h-8 lg:w-8 lg:text-[13px] xl:h-9 xl:w-9 xl:text-sm">
                            {(party.name || 'P').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 lg:text-[13px] xl:text-sm">{party.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">{party.email || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          party.type === 'customer'
                            ? 'bg-amber-100 text-amber-700'
                            : party.type === 'supplier'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-cyan-100 text-cyan-700'
                        } lg:px-2 lg:py-0.5 lg:text-[11px] xl:px-2.5 xl:py-1 xl:text-xs`}>
                          {party.type === 'customer' ? 'Customer' : party.type === 'supplier' ? 'Supplier' : 'Cash'}
                        </span>
                      </td>
                      <td className="px-4 py-3 lg:px-3 lg:py-2.5 xl:px-4 xl:py-3">
                        <p className="text-sm text-slate-700 lg:text-[13px] xl:text-sm">{party.mobile || '-'}</p>
                        <p className="text-xs text-slate-500 lg:text-[11px] xl:text-xs">{party.state || '-'}</p>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm">
                        {party.receivable > 0 ? formatCurrency(party.receivable) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-rose-600 lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm">
                        {party.payable > 0 ? formatCurrency(party.payable) : '-'}
                      </td>
                      <td className={`px-4 py-3 text-right text-sm font-black lg:px-3 lg:py-2.5 lg:text-[13px] xl:px-4 xl:py-3 xl:text-sm ${(party.netBalance || 0) >= 0 ? 'text-sky-600' : 'text-rose-600'}`}>
                        {formatCurrency(party.netBalance || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="rounded-full bg-slate-100 p-4">
                          <Users className="h-7 w-7 text-slate-400" />
                        </div>
                        <p className="mt-4 text-base font-semibold text-slate-700">No parties found</p>
                        <p className="mt-1 text-sm text-slate-500">Try adjusting the search or balance filter.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
