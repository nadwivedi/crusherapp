import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Products() {
  return (
    <PageLayout
      eyebrow="Masters"
      title="Stock Items"
      description="Manage your product inventory"
      metrics={[
        { label: 'Module', value: 'Stock Items', tone: 'cyan' },
        { label: 'Type', value: 'Master', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Product Inventory"
        description="Manage your stock items and materials"
      >
        <WorkflowList
          items={[
            { title: 'Create Item', description: 'Add new stock item with details' },
            { title: 'Track Stock', description: 'Monitor inventory levels' },
            { title: 'Manage Pricing', description: 'Set rates and prices for items' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Item', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press M then Stock Item' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
