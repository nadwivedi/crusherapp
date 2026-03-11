import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function ExpenseGroups() {
  return (
    <PageLayout
      eyebrow="Expense"
      title="Expense Groups"
      description="Manage expense categories"
      metrics={[
        { label: 'Module', value: 'Expense Groups', tone: 'emerald' },
        { label: 'Type', value: 'Master', tone: 'cyan' }
      ]}
    >
      <PageCard
        title="Expense Categories"
        description="Define and manage expense groups for better tracking"
      >
        <WorkflowList
          items={[
            { title: 'Create Group', description: 'Add new expense category' },
            { title: 'Edit Group', description: 'Modify existing expense categories' },
            { title: 'Delete Group', description: 'Remove unused categories' }
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
            { label: 'Navigation', value: 'Press E then Group' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
