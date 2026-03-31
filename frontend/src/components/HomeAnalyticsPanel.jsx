import { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CalendarDays, Package, PieChart, Target, Calendar, BookText, ChevronDown } from 'lucide-react';
import apiClient from '../utils/api';

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

const formatCurrency = (value) => (
  `Rs ${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`
);

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6', '#6366f1'];

function StatCard({ title, value, subtitle, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-[0_16px_30px_rgba(15,23,42,0.08)] lg:px-3 lg:py-2.5 xl:px-4 xl:py-3 relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 lg:text-[9px] xl:text-[10px]">{title}</p>
          <p className="mt-1 text-lg font-black text-slate-800 lg:text-base xl:text-lg">{value}</p>
          <p className="mt-0.5 text-xs text-slate-500 lg:text-[11px] xl:text-xs font-medium">{subtitle}</p>
        </div>
        <div className={`rounded-xl bg-gradient-to-br p-2 text-white lg:p-1.5 xl:p-2 ${tone}`}>
          <Icon className="h-4 w-4 lg:h-3.5 lg:w-3.5 xl:h-4 xl:w-4" />
        </div>
      </div>
    </div>
  );
}

export default function HomeAnalyticsPanel() {
  const [boulderTimeframe, setBoulderTimeframe] = useState('7d');
  const [expenseTimeframe, setExpenseTimeframe] = useState('7d');
  const [salesTimeframe, setSalesTimeframe] = useState('7d');
  const [plTimeframe, setPlTimeframe] = useState('lifetime');
  const [plExpanded, setPlExpanded] = useState({ sales: false, expenses: false });
  const [data, setData] = useState({
    boulders: { today: 0, last7Days: 0, last30Days: 0, thisYear: 0, lifetime: 0 },
    expenses: { today: 0, last7Days: 0, last30Days: 0, thisYear: 0, lifetime: 0 },
    sales: {
      totals: { today: 0, last7Days: 0, last30Days: 0, thisYear: 0, lifetime: 0 },
      revenue: { today: 0, last7Days: 0, last30Days: 0, thisYear: 0, lifetime: 0 },
      breakdown: []
    },
    outstanding: { totalReceivables: 0, totalPayables: 0, topDebtors: [], topCreditors: [] }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/reports/dashboard-analytics');
        setData(response || {});
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load analytics dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const ExpenseCategoryTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">{label}</p>
          <p className="text-sm font-black text-rose-600 mt-1">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const ProfitMarginTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const revenue = payload.find(p => p.dataKey === 'revenue')?.value || 0;
      const expense = payload.find(p => p.dataKey === 'expense')?.value || 0;
      const profit = revenue - expense;
      
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">{label}</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-bold text-emerald-600 flex justify-between gap-4">
              <span>Revenue:</span> <span>{formatCurrency(revenue)}</span>
            </p>
            <p className="text-xs font-bold text-rose-500 flex justify-between gap-4">
              <span>Expense:</span> <span>{formatCurrency(expense)}</span>
            </p>
            <div className="h-px w-full bg-slate-200 my-1"></div>
            <p className={`text-sm font-black flex justify-between gap-4 ${profit >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
              <span>Profit:</span> <span>{formatCurrency(profit)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const DailyTrendTooltip = ({ active, payload, label, isTons }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">{label}</p>
          <p className={`text-sm font-black mt-1 ${isTons ? 'text-sky-600' : 'text-rose-600'}`}>
            {isTons ? `${formatNumber(payload[0].value / 1000)} TONS` : formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-bold text-slate-800 uppercase tracking-widest text-[10px]">{label}</p>
          <p className="text-sm font-black text-sky-600 mt-1">
            {formatNumber(payload[0].value / 1000)} TONS
          </p>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5">
            {formatCurrency(payload[0].payload.amount)}
          </p>
        </div>
      );
    }
    return null;
  };

  const { boulders, expenses, sales, outstanding } = data;
  
  const tfStatsMap = {
     '3d': 'last3Days',
     '7d': 'last7Days',
     '30d': 'last30Days',
     '90d': 'last90Days',
     'thisYear': 'thisYear',
     'lifetime': 'lifetime'
  };

  const profitMarginData = useMemo(() => {
    const revTrend = sales?.revenue?.trends?.[salesTimeframe] || [];
    const expTrend = expenses?.trends?.[salesTimeframe] || [];
    
    const dateMap = new Map();
    expTrend.forEach(item => {
      dateMap.set(item.date, item.amount);
    });
    
    return revTrend.map(item => ({
      date: item.date,
      revenue: item.amount,
      expense: dateMap.get(item.date) || 0,
    }));
  }, [sales, expenses, salesTimeframe]);

  if (loading) {
    return <div className="p-10 text-center text-sm font-semibold text-slate-500">Loading Analytics Dashboard...</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-sm font-semibold text-rose-500">{error}</div>;
  }

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* Outstanding Financials Section */}
      <div className="bg-white rounded-[24px] shadow-xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-emerald-600" /> Outstanding Balances (Cash Flow)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
           <StatCard title="Total Receivables" value={formatCurrency(outstanding?.totalReceivables)} subtitle="Credit you need to collect" icon={Package} tone="from-emerald-500 to-teal-500" />
           <StatCard title="Total Payables" value={formatCurrency(outstanding?.totalPayables)} subtitle="Debt you need to pay" icon={Package} tone="from-rose-500 to-pink-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5 border-b border-slate-200/60 pb-8">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[300px] overflow-y-auto">
             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top 5 Debtors (Receivables)</h4>
             <div className="space-y-3">
               {(outstanding?.topDebtors || []).map((party, i) => (
                  <div key={party.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                     <span className="text-sm font-bold text-slate-700">{i+1}. {party.name}</span>
                     <span className="text-sm font-black text-emerald-600">{formatCurrency(party.balance)}</span>
                  </div>
               ))}
               {(!outstanding?.topDebtors || outstanding.topDebtors.length === 0) && (
                 <div className="text-center text-sm text-slate-400 mt-5">No receivable data</div>
               )}
             </div>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[300px] overflow-y-auto">
             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Top 5 Creditors (Payables)</h4>
             <div className="space-y-3">
               {(outstanding?.topCreditors || []).map((party, i) => (
                  <div key={party.id} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                     <span className="text-sm font-bold text-slate-700">{i+1}. {party.name}</span>
                     <span className="text-sm font-black text-rose-600">{formatCurrency(party.balance)}</span>
                  </div>
               ))}
               {(!outstanding?.topCreditors || outstanding.topCreditors.length === 0) && (
                 <div className="text-center text-sm text-slate-400 mt-5">No payable data</div>
               )}
             </div>
          </div>
        </div>
      </div>
      
      {/* Boulder Section */}
      <div className="bg-white rounded-[24px] shadow-xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-sky-500" /> Boulder Crushed (Net Weight TONS)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 xl:gap-5">
          <StatCard title="Today" value={formatNumber((boulders?.today || 0) / 1000)} subtitle="tons crushed today" icon={CalendarDays} tone="from-sky-500 to-cyan-500" />
          <StatCard title="Last 7 Days" value={formatNumber((boulders?.last7Days || 0) / 1000)} subtitle="tons crushed in 7 days" icon={Calendar} tone="from-indigo-500 to-blue-500" />
          <StatCard title="Last 30 Days" value={formatNumber((boulders?.last30Days || 0) / 1000)} subtitle="tons crushed in 30 days" icon={Calendar} tone="from-indigo-400 to-blue-400" />
          <StatCard title="This Year" value={formatNumber((boulders?.thisYear || 0) / 1000)} subtitle="tons crushed this year" icon={PieChart} tone="from-emerald-500 to-teal-500" />
          <StatCard title="Lifetime" value={formatNumber((boulders?.lifetime || 0) / 1000)} subtitle="total tons crushed" icon={Package} tone="from-purple-500 to-violet-500" />
        </div>

        <div className="mt-5">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Trend (Line Chart) <span className="text-[10px] ml-1">TONS</span>
              </h4>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['7d', '30d', '90d', 'thisYear', 'lifetime'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setBoulderTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition ${boulderTimeframe === tf ? 'bg-white shadow text-sky-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tf.replace('thisYear', 'Year')}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={boulders?.trends?.[boulderTimeframe] || []} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}T`} dx={-10} width={40} />
                <Tooltip content={<DailyTrendTooltip isTons />} cursor={{ fill: '#f1f5f9' }} />
                <Line type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-white rounded-[24px] shadow-xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-rose-500" /> Core Expenses
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 xl:gap-5">
          <StatCard title="Today" value={formatCurrency(expenses?.today)} subtitle="expenses today" icon={CalendarDays} tone="from-rose-500 to-pink-500" />
          <StatCard title="Last 7 Days" value={formatCurrency(expenses?.last7Days)} subtitle="expenses in 7 days" icon={Calendar} tone="from-orange-500 to-amber-500" />
          <StatCard title="Last 30 Days" value={formatCurrency(expenses?.last30Days)} subtitle="expenses in 30 days" icon={Calendar} tone="from-orange-400 to-amber-400" />
          <StatCard title="This Year" value={formatCurrency(expenses?.thisYear)} subtitle="expenses this year" icon={PieChart} tone="from-fuchsia-500 to-fuchsia-600" />
          <StatCard title="Lifetime" value={formatCurrency(expenses?.lifetime)} subtitle="total expenses" icon={Package} tone="from-rose-600 to-pink-600" />
        </div>

        <div className="mt-5 mb-5">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Trend (Line Chart) <span className="text-[10px] ml-1">Amount Rs</span>
              </h4>
               <div className="flex bg-slate-100 p-1 rounded-lg">
                {['7d', '30d', '90d', 'thisYear', 'lifetime'].map(tf => (
                  <button
                    key={tf}
                    onClick={() => setExpenseTimeframe(tf)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition ${expenseTimeframe === tf ? 'bg-white shadow text-rose-700' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tf.replace('thisYear', 'Year')}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={expenses?.trends?.[expenseTimeframe] || []} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} dx={-10} width={40} />
                <Tooltip content={<DailyTrendTooltip isTons={false} />} cursor={{ fill: '#f1f5f9' }} />
                <Line type="monotone" dataKey="amount" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-4 mt-5 lg:mb-3 xl:mb-4">
          <PieChart className="w-4 h-4 text-orange-500" /> Expense Category Breakdown
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenses?.breakdown || []}
                margin={{ top: 20, right: 20, left: 10, bottom: 40 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }} 
                  tickMargin={12}
                  angle={-20}
                  textAnchor="end"
                  formatter={(value) => value.substring(0, 12)}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} 
                  dx={-10}
                />
                <Tooltip content={<ExpenseCategoryTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {(expenses?.breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leaderboard */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px] overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Highest Expenses</h4>
            <div className="space-y-3">
              {(expenses?.breakdown || []).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }} />
                    <span className="text-sm font-bold text-slate-700 uppercase">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-rose-600">{formatCurrency(item.amount)}</span>
                  </div>
                </div>
              ))}
              {(!expenses?.breakdown || expenses.breakdown.length === 0) && (
                <div className="text-center text-sm text-slate-400 mt-5">No expense data found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sales Section */}
      <div className="bg-white rounded-[24px] shadow-xl border border-slate-200 p-6 sm:p-8">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
          <PieChart className="w-4 h-4 text-emerald-500" /> Sales & Revenue
        </h3>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4 xl:gap-5 mb-6">
          <StatCard title="Today Revenue" value={formatCurrency(sales?.revenue?.today)} subtitle="generated today" icon={CalendarDays} tone="from-emerald-500 to-teal-500" />
          <StatCard title="Last 7 Days" value={formatCurrency(sales?.revenue?.last7Days)} subtitle="revenue in 7 days" icon={Calendar} tone="from-emerald-400 to-teal-400" />
          <StatCard title="Last 30 Days" value={formatCurrency(sales?.revenue?.last30Days)} subtitle="revenue in 30 days" icon={Calendar} tone="from-emerald-300 to-teal-300" />
          <StatCard title="This Year" value={formatCurrency(sales?.revenue?.thisYear)} subtitle="revenue this year" icon={PieChart} tone="from-teal-500 to-cyan-500" />
          <StatCard title="Lifetime" value={formatCurrency(sales?.revenue?.lifetime)} subtitle="total revenue" icon={Package} tone="from-emerald-600 to-teal-600" />
        </div>

        {/* Profit Margin Chart */}
        <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px] mb-5">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Profit Margin Overlay <span className="text-[10px] ml-1">(Revenue vs Expense)</span>
            </h4>
             <div className="flex bg-slate-100 p-1 rounded-lg">
              {['7d', '30d', '90d', 'thisYear', 'lifetime'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setSalesTimeframe(tf)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition ${salesTimeframe === tf ? 'bg-white shadow text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tf.replace('thisYear', 'Year')}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={profitMarginData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} dx={-10} width={40} />
              <Tooltip content={<ProfitMarginTooltip />} cursor={{ fill: '#f1f5f9' }} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] xl:grid-cols-[1fr_300px] gap-5 mt-8">
          {/* Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sales?.breakdown || []}
                margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
                barSize={40}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="size" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }} 
                  tickMargin={10} 
                  formatter={(value) => value.toUpperCase()}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)} T`} 
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 8 }} />
                <Bar dataKey="quantity" radius={[6, 6, 0, 0]}>
                  {(sales?.breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Leaderboard */}
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 shadow-sm h-[320px] overflow-y-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Quantity Ranked</h4>
            <div className="space-y-3">
              {(sales?.breakdown || []).map((item, index) => (
                <div key={item.size} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm font-bold text-slate-700 uppercase">{item.size}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-black text-slate-800">{formatNumber((item.quantity || 0) / 1000)} <span className="text-[10px] text-slate-400 font-bold">TONS</span></span>
                  </div>
                </div>
              ))}
              {(!sales?.breakdown || sales.breakdown.length === 0) && (
                <div className="text-center text-sm text-slate-400 mt-5">No sales data found</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compact P&L Report Section */}
      <div className="bg-white rounded-[24px] shadow-xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <BookText className="w-4 h-4 text-violet-500" /> Compact P&L Report
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['3d', '7d', '30d', '90d', 'thisYear', 'lifetime'].map(tf => (
              <button
                key={tf}
                onClick={() => setPlTimeframe(tf)}
                className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition ${plTimeframe === tf ? 'bg-white shadow text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tf.replace('thisYear', 'Year')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Boulder */}
          <div className="flex justify-between items-center p-4 sm:px-6 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="font-bold text-slate-700">Total Boulder Crushed</span>
            <span className="font-black text-sky-600">{formatNumber((boulders?.[tfStatsMap[plTimeframe]] || 0) / 1000)} TONS</span>
          </div>

          {/* Sales Dropdown */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div 
              className="flex justify-between items-center p-4 sm:px-6 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition"
              onClick={() => setPlExpanded(prev => ({ ...prev, sales: !prev.sales }))}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Total Sales</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${plExpanded.sales ? 'rotate-180' : ''}`} />
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-600 mr-2">{formatNumber((sales?.totals?.[tfStatsMap[plTimeframe]] || 0) / 1000)} TONS</span>
                <span className="font-bold text-emerald-800/60 text-xs sm:text-sm">({formatCurrency(sales?.revenue?.[tfStatsMap[plTimeframe]])})</span>
              </div>
            </div>
            {plExpanded.sales && (
              <div className="p-4 sm:px-6 bg-white border-t border-slate-100 space-y-3">
                {(sales?.breakdowns?.[plTimeframe] || []).length > 0 ? (
                  (sales?.breakdowns?.[plTimeframe] || []).map(item => (
                    <div key={item.size} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="font-bold text-slate-600 uppercase">{item.size}</span>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <span className="font-bold text-slate-800">{formatNumber(item.quantity / 1000)} T</span>
                        <span className="text-slate-500 font-medium text-xs w-24 text-right">{formatCurrency(item.amount)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-400 py-2">No sales data available</div>
                )}
              </div>
            )}
          </div>

          {/* Expense Dropdown */}
          <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
            <div 
              className="flex justify-between items-center p-4 sm:px-6 bg-slate-50/80 cursor-pointer hover:bg-slate-100 transition"
              onClick={() => setPlExpanded(prev => ({ ...prev, expenses: !prev.expenses }))}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Total Expenses</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${plExpanded.expenses ? 'rotate-180' : ''}`} />
              </div>
              <span className="font-black text-rose-600">{formatCurrency(expenses?.[tfStatsMap[plTimeframe]])}</span>
            </div>
            {plExpanded.expenses && (
              <div className="p-4 sm:px-6 bg-white border-t border-slate-100 space-y-3">
                {(expenses?.breakdowns?.[plTimeframe] || []).length > 0 ? (
                  (expenses?.breakdowns?.[plTimeframe] || []).map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm py-1 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                        <span className="font-bold text-slate-600 truncate max-w-[200px]">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{formatCurrency(item.amount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-slate-400 py-2">No expense data available</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
