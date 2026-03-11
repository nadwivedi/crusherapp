import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Purchases() {
  return (
    <PageLayout
      eyebrow="Vouchers"
      title="Purchase Management"
      description="Record and manage purchase transactions"
      metrics={[
        { label: 'Module', value: 'Purchase', tone: 'amber' },
        { label: 'Type', value: 'Voucher', tone: 'emerald' }
      ]}
    >
      <PageCard
        title="Purchase Entries"
        description="Manage your purchase vouchers here"
      >
        <WorkflowList
          items={[
            { title: 'Create Purchase', description: 'Add new purchase voucher with party and item details' },
            { title: 'View History', description: 'Browse through previous purchase transactions' },
            { title: 'Track Payments', description: 'Monitor payment status for purchases' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Purchase', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press V then P' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
