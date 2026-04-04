import MarketingHero from '../components/MarketingHero';
import FeatureShowcase from '../components/FeatureShowcase';
import ContactActions from '../components/ContactActions';
import Seo from '../components/Seo';

const homeSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'CrusherBook',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://crusherbook.com',
  image: 'https://crusherbook.com/cruhserbook.webp',
  description: 'Stone crusher plant ERP software for sales slips, boulder entry, weighbridge workflow, stock, ledger, expenses, and profit reports.',
  offers: [
    {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '14999',
      name: 'Basic',
    },
    {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: '19999',
      name: 'Advanced',
    },
  ],
};

const Home = () => {
  return (
    <div className="w-full">
      <Seo
        title="Stone Crusher Plant ERP Software"
        description="CrusherBook is stone crusher plant ERP software for weighbridge workflow, sales slips, boulder entry, stock management, party ledger, expenses, employee access, and profit reports."
        path="/"
        keywords={[
          'stone crusher plant ERP software',
          'crusher management software',
          'crusher billing software',
          'weighbridge software',
          'stone crusher ledger software',
          'crusher stock management software',
        ]}
        schema={homeSchema}
      />
      <MarketingHero />
      <FeatureShowcase />
      <section className="bg-brand-navy px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Run Sales, Boulder, Ledger, Stock, and Profit Reporting From One Software</h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 md:text-lg">
            Crusherbook helps crusher plants manage weightbridge-based entry, slip-based entry, party ledger, expenses, employee work, and stock movement without depending on manual registers.
          </p>
          <div className="mt-8">
            <ContactActions primaryLabel="WhatsApp For Pricing" secondaryLabel="Call For Demo" />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold text-brand-navy md:text-4xl">Why Crusher Plants Choose CrusherBook</h2>
            <p className="mt-4 text-base leading-relaxed text-brand-slate md:text-lg">
              Built for stone crusher plants that need faster entry, cleaner records, and better control across dispatch, stock, and reporting.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-brand-navy">Built for Daily Plant Operations</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-slate sm:text-base">
                Manage sales slips, boulder entry, stock movement, party wise ledger, expenses, employee access, and profit reports from one crusher management system.
              </p>
            </div>
            <div className="rounded-3xl border border-gray-100 bg-gray-50 p-6">
              <h3 className="text-xl font-bold text-brand-navy">Ready for Weighbridge Workflow</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-slate sm:text-base">
                Use slip-based entry now and move toward weightbridge-connected workflow for faster dispatch entry and reduced manual typing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-navy md:text-4xl">Frequently Asked Questions</h2>
          </div>
          <div className="mt-10 space-y-4">
            {[
              {
                question: 'What is CrusherBook?',
                answer: 'CrusherBook is stone crusher plant ERP software for managing slips, ledger, stock, expenses, employees, and reports.',
              },
              {
                question: 'Can CrusherBook help with weighbridge workflow?',
                answer: 'Yes. CrusherBook supports slip-based workflow today and is suited for weightbridge-based operational entry flow.',
              },
              {
                question: 'Can I manage party wise ledger and expenses?',
                answer: 'Yes. The software includes party wise ledger, record management, expense tracking, and stock visibility.',
              },
              {
                question: 'Do you offer pricing for different plant needs?',
                answer: 'Yes. Basic starts at Rs 14,999 per year and Advanced starts at Rs 19,999 per year.',
              },
            ].map((item) => (
              <div key={item.question} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-brand-navy">{item.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-slate sm:text-base">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
