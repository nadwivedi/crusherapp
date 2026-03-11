import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Receipts() {
  return (
    <PageLayout
      eyebrow="Vouchers"
      title="Receipt Management"
      description="Record and manage receipt transactions"
      metrics={[
        { label: 'Module', value: 'Receipt', tone: 'amber' },
        { label: 'Type', value: 'Voucher', tone: 'emerald' }
      ]}
    >
      <PageCard
        title="Receipt Entries"
        description="Manage your receipt vouchers here"
      >
        <WorkflowList
          items={[
            { title: 'Create Receipt', description: 'Record incoming payments from parties' },
            { title: 'View History', description: 'Browse through receipt transactions' },
            { title: 'Link to Sales', description: 'Associate receipts with sales vouchers' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Receipt', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press V then Receipt' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
