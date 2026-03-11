import Sidebar from './Sidebar';

function MetricCard({ label, value, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-200/70 bg-cyan-50/70 text-cyan-900',
    amber: 'border-amber-200/70 bg-amber-50/70 text-amber-900',
    emerald: 'border-emerald-200/70 bg-emerald-50/70 text-emerald-900'
  };

  return (
    <div className={`rounded-3xl border p-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] ${tones[tone] || tones.cyan}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

export function PageCard({ title, description, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function InfoList({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
          <p className="mt-1 text-sm text-slate-700">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function WorkflowList({ items }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
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
  );
}

export default function PageLayout({ eyebrow, title, description, metrics, children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_18%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.08),transparent_20%),linear-gradient(180deg,#eef4ff_0%,#f8fafc_46%,#eff6ff_100%)] text-slate-900">
      <Sidebar />

      <main className="min-h-screen md:pl-[14rem]">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-24 md:px-8 md:pb-14 md:pt-8">
          <section className="rounded-[32px] border border-slate-200/80 bg-white/88 p-7 shadow-[0_30px_80px_rgba(15,23,42,0.1)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              {description}
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <MetricCard key={metric.label} label={metric.label} value={metric.value} tone={metric.tone} />
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
