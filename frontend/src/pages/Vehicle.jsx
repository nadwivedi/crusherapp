import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Vehicle() {
  return (
    <PageLayout
      eyebrow="Master Records"
      title="Vehicle dispatch workspace"
      description="Vehicle now lives inside the same left-side navigation pattern as the accounts app, so users can move between modules without losing the overall structure."
      metrics={[
        { label: 'Module', value: 'Vehicle', tone: 'cyan' },
        { label: 'Focus', value: 'Trips + Fleet', tone: 'amber' },
        { label: 'Links', value: 'Party / Sales', tone: 'emerald' }
      ]}
    >
      <PageCard
        title="Dispatch flow"
        description="Use this section for trip entry, owner assignment, and route-level vehicle summaries."
      >
        <WorkflowList
          items={[
            { title: 'Register fleet units', description: 'Store truck number, owner, and carrying details in a consistent master page.' },
            { title: 'Track movement', description: 'Attach loading point, destination, and trip status to each vehicle record.' },
            { title: 'Send to sales', description: 'Keep dispatch details aligned with the sales page for invoice generation.' }
          ]}
        />
      </PageCard>

      <PageCard
        title="What changed"
        description="The important part here is the UI shell: homepage links, sidebar links, and dedicated page routing now match the pattern from accounts."
      >
        <InfoList
          items={[
            { label: 'Home link', value: 'Vehicle appears as a clickable navigation item on the new homepage.' },
            { label: 'Page shell', value: 'This page keeps the sidebar pinned on desktop and available via drawer on mobile.' },
            { label: 'Backend ready', value: 'Your existing /api/vehicles endpoints can be wired into this layout later.' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
