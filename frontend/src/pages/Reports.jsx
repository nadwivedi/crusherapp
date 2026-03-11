import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Reports() {
  return (
    <PageLayout
      eyebrow="Reports"
      title="Reports Dashboard"
      description="View and analyze business reports"
      metrics={[
        { label: 'Module', value: 'Reports', tone: 'cyan' },
        { label: 'Type', value: 'Analytics', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Available Reports"
        description="Generate and view various business reports"
      >
        <WorkflowList
          items={[
            { title: 'Sales Report', description: 'Analyze sales performance and trends' },
            { title: 'Purchase Report', description: 'Review purchase transactions and analysis' },
            { title: 'Party Ledger', description: 'View party-wise transaction history' },
            { title: 'Stock Summary', description: 'Check inventory levels and movements' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Generate reports quickly"
      >
        <InfoList
          items={[
            { label: 'New Report', value: 'Select report type from menu' },
            { label: 'Navigation', value: 'Press R' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
