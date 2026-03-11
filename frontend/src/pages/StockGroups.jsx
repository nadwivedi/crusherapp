import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function StockGroups() {
  return (
    <PageLayout
      eyebrow="Masters"
      title="Stock Groups"
      description="Manage stock item categories"
      metrics={[
        { label: 'Module', value: 'Stock Groups', tone: 'cyan' },
        { label: 'Type', value: 'Master', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Stock Categories"
        description="Organize your inventory with stock groups"
      >
        <WorkflowList
          items={[
            { title: 'Create Group', description: 'Add new stock category' },
            { title: 'Manage Hierarchy', description: 'Set up parent-child relationships' },
            { title: 'Link Items', description: 'Associate stock items with groups' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Group', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press M then Stock Group' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
