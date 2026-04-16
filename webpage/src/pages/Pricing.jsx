import { CheckCircle2, ScanText, Scale, Users, Wallet, Boxes, ChartColumnBig } from 'lucide-react';
import ContactActions from '../components/ContactActions';
import Seo from '../components/Seo';

const plans = [
  {
    name: 'Basic',
    price: 'Rs 13,999',
    period: 'per year',
    badge: 'Starter Plan',
    tone: 'border-gray-200 bg-white',
    description: 'For entry, records, and ledger.',
    features: [
      'Crusher entry',
      'Manage records',
      'Party wise ledger',
      'Sales & boulder entry',
      'Expense management',
      'Stock movement',
    ],
  },
  {
    name: 'Advanced',
    price: 'Rs 17,999',
    period: 'per year',
    badge: 'Most Popular',
    tone: 'border-orange-200 bg-gradient-to-br from-orange-50 to-white',
    description: 'For auto slip and weightbridge entry.',
    features: [
      'Everything in Basic',
      'Auto slip entry',
      'Weightbridge entry',
      'Faster weight capture',
      'Less manual entry',
      'Dispatch flow',
    ],
  },
];

const highlightCards = [
  {
    icon: Scale,
    title: 'Weightbridge Entry',
    description: 'Weightbridge-based entry.',
  },
  {
    icon: ScanText,
    title: 'Auto Slip Entry',
    description: 'Slip-based entry.',
  },
  {
    icon: Users,
    title: 'Party Wise Ledger',
    description: 'Party account tracking.',
  },
  {
    icon: ChartColumnBig,
    title: 'Stock & Profit Visibility',
    description: 'Stock and profit view.',
  },
];

export default function Pricing() {
  return (
    <div className="w-full bg-gray-50 pt-10 pb-24">
      <Seo
        title="Crusher ERP Pricing"
        description="CrusherBook pricing includes Basic at Rs 13,999 per year and Advanced at Rs 17,999 per year with auto slip and weightbridge entry support."
        path="/pricing"
        keywords={[
          'crusher software pricing',
          'stone crusher ERP pricing',
          'weighbridge software pricing',
          'crusherbook pricing',
        ]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'CrusherBook Pricing',
          url: 'https://crusherbook.com/pricing',
        }}
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex rounded-full bg-brand-orange/10 px-4 py-2 text-sm font-semibold text-brand-orange">
            Simple Annual Pricing
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-navy md:text-4xl">
            Choose The Plan That Fits Your Crusher Plant
          </h1>
          <p className="mt-4 text-base leading-relaxed text-brand-slate">
            Basic for records. Advanced for automation.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-[2rem] border p-8 shadow-sm md:p-10 ${plan.tone}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-orange">{plan.badge}</p>
                  <h2 className="mt-2 text-xl font-bold text-brand-navy">{plan.name}</h2>
                </div>
                <span className="rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold text-white">
                  Annual
                </span>
              </div>

              <div className="mt-8 border-b border-gray-200 pb-8">
                <p className="text-3xl font-black text-brand-navy md:text-4xl">{plan.price}</p>
                <p className="mt-2 text-base font-medium text-brand-slate">{plan.period}</p>
                <p className="mt-3 text-sm leading-relaxed text-brand-slate">{plan.description}</p>
              </div>

              <div className="mt-6 space-y-2">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-2.5 rounded-xl border border-gray-100 bg-white/80 px-3 py-2.5"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    <p className="text-xs font-medium leading-relaxed text-slate-700 sm:text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] bg-brand-navy p-8 text-white shadow-2xl md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-bold">Need Help Choosing A Plan?</h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80 sm:text-base">
                Basic for records. Advanced for auto slip and weightbridge.
              </p>
            </div>
            <ContactActions align="left" primaryLabel="Get Pricing on WhatsApp" secondaryLabel="Call for Demo" />
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {highlightCards.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-navy">{title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-brand-slate sm:text-sm">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-[2rem] border border-gray-100 bg-white p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold text-brand-navy">Core Business Controls</h2>
            <p className="mt-3 text-sm leading-relaxed text-brand-slate sm:text-base">
              Records, ledger, stock, and reporting in one place.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700 sm:text-sm">
            <span className="rounded-full bg-orange-50 px-4 py-2">Crusher Entry</span>
            <span className="rounded-full bg-blue-50 px-4 py-2">Sales Slip Entry</span>
            <span className="rounded-full bg-slate-100 px-4 py-2">Boulder Slip Entry</span>
            <span className="rounded-full bg-green-50 px-4 py-2">Party Ledger</span>
            <span className="rounded-full bg-yellow-50 px-4 py-2">Expense Management</span>
            <span className="rounded-full bg-purple-50 px-4 py-2">Stock Movement</span>
            <span className="rounded-full bg-pink-50 px-4 py-2">Profit &amp; Loss</span>
            <span className="rounded-full bg-emerald-50 px-4 py-2">Employee Add/View</span>
            <span className="rounded-full bg-cyan-50 px-4 py-2">Weightbridge Support</span>
          </div>
        </div>
      </section>
    </div>
  );
}
