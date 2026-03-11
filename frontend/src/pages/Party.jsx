import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Party() {
  return (
    <PageLayout
      eyebrow="Master Records"
      title="Party management with the same navigation shell"
      description="This page keeps the accounts-style navigation visible while giving Party its own workspace. You can attach the existing backend CRUD here next without changing the layout."
      metrics={[
        { label: 'Module', value: 'Party', tone: 'cyan' },
        { label: 'Focus', value: 'Contacts + Ledger', tone: 'emerald' },
        { label: 'Linked To', value: 'Sales / Vehicle', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Suggested workflow"
        description="A page-specific content area now sits beside the persistent navigation, matching the structure you asked to copy from accounts."
      >
        <WorkflowList
          items={[
            { title: 'Create party profiles', description: 'Add customers, suppliers, and contractors with their billing and transport details.' },
            { title: 'Connect vehicles and dispatch', description: 'Use the same party references across trip logs and sales vouchers.' },
            { title: 'Review dues quickly', description: 'Reserve this section for balances, last transactions, and follow-up reminders.' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Page notes"
        description="The UI is ready for actual form fields, tables, and API calls when you want to continue beyond navigation."
      >
        <InfoList
          items={[
            { label: 'Navigation', value: 'Homepage item opens this page directly from the new accordion menu.' },
            { label: 'Mobile', value: 'The same module links are available through the slide-out sidebar on smaller screens.' },
            { label: 'Next hook', value: 'Connect /api/parties data into this content column without changing the shell.' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
