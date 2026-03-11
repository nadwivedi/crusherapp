import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Expenses() {
  return (
    <PageLayout
      eyebrow="Expense"
      title="Expense Management"
      description="Track and manage business expenses"
      metrics={[
        { label: 'Module', value: 'Expense', tone: 'emerald' },
        { label: 'Type', value: 'Transaction', tone: 'amber' }
      ]}
    >
      <PageCard
        title="Expense Entries"
        description="Record your business expenses here"
      >
        <WorkflowList
          items={[
            { title: 'Create Expense', description: 'Add new expense with category and amount' },
            { title: 'View History', description: 'Browse through expense transactions' },
            { title: 'Categorize', description: 'Group expenses by category for reporting' }
          ]}
        />
      </PageCard>

      <PageCard
        title="Quick Actions"
        description="Common operations"
      >
        <InfoList
          items={[
            { label: 'New Expense', value: 'Use + button or Alt+N' },
            { label: 'Navigation', value: 'Press E' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
