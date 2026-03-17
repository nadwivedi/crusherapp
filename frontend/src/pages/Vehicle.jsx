import { Link } from 'react-router-dom';

const workflowItems = [
  {
    title: 'Register vehicles',
    description: 'Keep truck number, owner, and capacity in one master list.'
  },
  {
    title: 'Use in vouchers',
    description: 'Reference the same vehicle records later in dispatch and sales flow.'
  },
  {
    title: 'Track status',
    description: 'Extend this page with trip status, route, and driver fields when the backend is ready.'
  }
];

const infoItems = [
  { label: 'Section', value: 'Masters' },
  { label: 'Menu', value: 'Manage Party, Manage Vehicle, Bank' },
  { label: 'Status', value: 'UI route is ready for vehicle management work.' }
];

export default function Vehicle() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.16),transparent_24%),linear-gradient(180deg,#0f172a_0%,#111827_48%,#020617_100%)] px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[32px] border border-white/15 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
          <div className="border-b border-slate-200/80 bg-white/80 px-5 py-5 backdrop-blur-sm md:px-8 md:py-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">Master Records</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">Manage Vehicle</h1>
                <p className="mt-1 text-sm font-medium text-slate-600">Vehicle now sits inside Masters with only the three requested entries.</p>
              </div>

              <div className="flex gap-3">
                <Link
                  to="/masters"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back To Masters
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 px-5 py-5 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-8">
            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Vehicle workflow</h2>
              <div className="mt-5 space-y-4">
                {workflowItems.map((item, index) => (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">Current setup</h2>
              <div className="mt-5 space-y-3">
                {infoItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
