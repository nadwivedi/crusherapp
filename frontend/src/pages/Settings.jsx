import PageLayout, { InfoList, PageCard, WorkflowList } from '../components/PageLayout';

export default function Settings() {
  return (
    <PageLayout
      eyebrow="Settings"
      title="Application Settings"
      description="Configure application preferences"
      metrics={[
        { label: 'Module', value: 'Settings', tone: 'slate' },
        { label: 'Type', value: 'Configuration', tone: 'amber' }
      ]}
    >
      <PageCard
        title="General Settings"
        description="Manage basic application settings"
      >
        <WorkflowList
          items={[
            { title: 'Company Profile', description: 'Update business name and details' },
            { title: 'Financial Year', description: 'Set and manage financial year' },
            { title: 'Currency', description: 'Configure currency preferences' }
          ]}
        />
      </PageCard>

      <PageCard
        title="User Preferences"
        description="Customize your experience"
      >
        <InfoList
          items={[
            { label: 'Theme', value: 'Light/Dark mode' },
            { label: 'Notifications', value: 'Manage alerts' },
            { label: 'Backup', value: 'Data backup settings' }
          ]}
        />
      </PageCard>
    </PageLayout>
  );
}
