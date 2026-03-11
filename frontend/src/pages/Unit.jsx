import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Unit() {
  return (
    <PageLayout
      eyebrow="Masters"
      title="Unit Management"
      description="Manage measurement units for stock items"
      metrics={[
        { label: 'Module', value: 'Units', tone: 'cyan' },
        { label: 'Type', value: 'Master', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Measurement Units"
        description="Define units for measuring stock items"
      >
        <WorkflowList
          items={[
            { title: 'Create Unit', description: 'Add new measurement unit (kg, ton, etc.)' },
            { title: 'Set Conversions', description: 'Define conversion rates between units' },
            { title: 'Assign to Items', description: 'Link units to stock items' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Unit', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press M then Unit' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
