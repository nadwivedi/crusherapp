import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Payments() {
  return (
    <PageLayout
      eyebrow="Vouchers"
      title="Payment Management"
      description="Record and manage payment transactions"
      metrics={[
        { label: 'Module', value: 'Payment', tone: 'amber' },
        { label: 'Type', value: 'Voucher', tone: 'emerald' }
      ]}
    >
      <PageCard
        title="Payment Entries"
        description="Manage your payment vouchers here"
      >
        <WorkflowList
          items={[
            { title: 'Create Payment', description: 'Record outgoing payments to parties' },
            { title: 'View History', description: 'Browse through payment transactions' },
            { title: 'Link to Purchases', description: 'Associate payments with purchase vouchers' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Payment', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press V then Payment' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
