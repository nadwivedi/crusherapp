import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Sales() {
  return (
    <PageLayout
      eyebrow="Voucher Entry"
      title="Sales page inside the shared navigation system"
      description="Sales now sits under a voucher section, mirroring the same grouped navigation idea from accounts. The homepage opens this page directly and the sidebar keeps it reachable everywhere else."
      metrics={[
        { label: 'Module', value: 'Sales', tone: 'amber' },
        { label: 'Focus', value: 'Billing + Dispatch', tone: 'cyan' },
        { label: 'Depends On', value: 'Party / Vehicle', tone: 'emerald' }
      ]}
    >
      <PageCard
        title="Sales process"
        description="The main content column can hold invoice forms, line items, and sales history while the navigation remains consistent around it."
      >
        <WorkflowList
          items={[
            { title: 'Create voucher entries', description: 'Add invoice date, party, vehicle, and rate details in a dedicated sales workspace.' },
            { title: 'Validate dispatch details', description: 'Cross-check linked vehicle and material data before confirmation.' },
            { title: 'Review register output', description: 'Use the side card or a full-width table for daily and party-wise sales summaries.' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Shell behavior"
        description="This is the same navigation model you requested: homepage menu, grouped navigation links, and individual pages."
      >
        <InfoList
          items={[
            { label: 'Grouped menu', value: 'Sales appears under the Vouchers section, similar to grouped links in accounts.' },
            { label: 'Active state', value: 'The current page stays highlighted in the sidebar for quick orientation.' },
            { label: 'Backend ready', value: 'Your existing /api/sales endpoints can plug into this page without changing routing.' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
