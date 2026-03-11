import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Boulder() {
  return (
    <PageLayout
      eyebrow="Master Records"
      title="Boulder source and stock view"
      description="Boulder now opens as its own screen from the shared navigation menu, following the same homepage-to-page behavior you showed in the accounts frontend."
      metrics={[
        { label: 'Module', value: 'Boulder', tone: 'emerald' },
        { label: 'Focus', value: 'Material Source', tone: 'cyan' },
        { label: 'Used In', value: 'Crusher Flow', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Operational steps"
        description="This content area is prepared for quarry intake, source ledger, and stock-position panels."
      >
        <WorkflowList
          items={[
            { title: 'Register incoming boulders', description: 'Capture source, date, and quantity before material enters the crusher process.' },
            { title: 'Monitor stock position', description: 'Display opening stock, incoming balance, and consumption snapshots here.' },
            { title: 'Connect outputs', description: 'Use the same data to support downstream sales and reconciliation pages.' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Layout readiness"
        description="The navigation behavior is in place; only business-specific widgets need to be added next."
      >
        <InfoList
          items={[
            { label: 'Access pattern', value: 'Homepage and sidebar both route into Boulder without changing the shell.' },
            { label: 'Visual style', value: 'Section headers, active rows, and mobile drawer follow the accounts layout style.' },
            { label: 'Next hook', value: 'Map /api/boulders into a form plus table when you want the full module built.' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
