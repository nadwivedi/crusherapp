import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'crusher-app-settings';

const defaultSettings = {
  companyLabel: 'Crusher Management',
  consoleLabel: 'Business Console',
  defaultLandingPage: '/',
  defaultReportRoute: '/reports',
  keyboardShortcuts: true,
  showQuickActions: true,
  compactTables: false
};

const defaultMaterialRates = {
  tenMmRate: '',
  twentyMmRate: '',
  fortyMmRate: '',
  sixtyMmRate: '',
  sixMmRate: '',
  fourMmRate: '',
  wmmRate: '',
  gsbRate: '',
  dustRate: ''
};

const landingPageOptions = [
  { value: '/', label: 'Home' },
  { value: '/expenses', label: 'Expense' },
  { value: '/reports', label: 'Reports' }
];

const reportOptions = [
  { value: '/reports', label: 'Reports Hub' },
  { value: '/day-book', label: 'Day Book' },
  { value: '/reports/party-ledger', label: 'Party Ledger' },
  { value: '/reports/stock-ledger', label: 'Stock Ledger' },
  { value: '/reports/boulder-ledger', label: 'Boulder Ledger' }
];

const toggleFields = [
  {
    key: 'keyboardShortcuts',
    title: 'Keyboard shortcuts',
    description: 'Keep quick keys active across the app.'
  },
  {
    key: 'showQuickActions',
    title: 'Homepage quick actions',
    description: 'Show shortcut cards on the homepage.'
  },
  {
    key: 'compactTables',
    title: 'Compact table mode',
    description: 'Save this preference for future table screens.'
  }
];

const readStoredSettings = () => {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch (error) {
    return defaultSettings;
  }
};

const readUserMaterialRates = (user) => ({
  tenMmRate: Number(user?.materialRates?.tenMmRate || 0) || '',
  twentyMmRate: Number(user?.materialRates?.twentyMmRate || 0) || '',
  fortyMmRate: Number(user?.materialRates?.fortyMmRate || 0) || '',
  sixtyMmRate: Number(user?.materialRates?.sixtyMmRate || 0) || '',
  sixMmRate: Number(user?.materialRates?.sixMmRate || 0) || '',
  fourMmRate: Number(user?.materialRates?.fourMmRate || 0) || '',
  wmmRate: Number(user?.materialRates?.wmmRate || 0) || '',
  gsbRate: Number(user?.materialRates?.gsbRate || 0) || '',
  dustRate: Number(user?.materialRates?.dustRate || 0) || ''
});

const materialRateFields = [
  { key: 'tenMmRate', label: '10mm Rate' },
  { key: 'twentyMmRate', label: '20mm Rate' },
  { key: 'fortyMmRate', label: '40mm Rate' },
  { key: 'sixtyMmRate', label: '60mm Rate' },
  { key: 'sixMmRate', label: '6mm Rate' },
  { key: 'fourMmRate', label: '4mm Rate' },
  { key: 'wmmRate', label: 'WMM Rate' },
  { key: 'gsbRate', label: 'GSB Rate' },
  { key: 'dustRate', label: 'Dust Rate' }
];

function SettingCard({ icon, title, description, children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-5 ${className}`}>
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y-[-50%] rounded-full bg-gradient-to-br from-sky-50 to-cyan-50 opacity-50"></div>
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          {icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-slate-900 md:text-lg">{title}</h3>
            {description && <p className="mt-0.5 text-xs text-slate-500 md:text-sm">{description}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoBadge({ icon, label, value, color = 'sky' }) {
  const colorClasses = {
    sky: 'bg-sky-50 border-sky-200 text-sky-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    violet: 'bg-violet-50 border-violet-200 text-violet-700'
  };
  
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${colorClasses[color]} px-4 py-3`}>
      {icon && <span className="text-lg">{icon}</span>}
      <div className="flex-1">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70">{label}</p>
        <p className="mt-0.5 font-semibold">{value}</p>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50">
      <div className="flex-1 pr-4">
        <span className="block font-medium text-slate-800">{label}</span>
        {description && <span className="mt-1 block text-sm text-slate-500">{description}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange({ target: { name: label.toLowerCase().replace(/\s+/g, ''), type: 'checkbox', checked: !checked } })}
        className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-sky-600' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}></span>
      </button>
    </label>
  );
}

export default function Setting() {
  const { user, logout, updateUserSettings } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(defaultSettings);
  const [materialRates, setMaterialRates] = useState(defaultMaterialRates);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(readStoredSettings());
    setMaterialRates(readUserMaterialRates(user));
    setIsLoaded(true);
  }, [user]);

  useEffect(() => {
    const isTypingTarget = (target) => {
      const tagName = target?.tagName?.toLowerCase();
      return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target?.isContentEditable;
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (isTypingTarget(event.target)) {
        return;
      }

      event.preventDefault();
      navigate('/', { replace: true });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const displayName = String(
    user?.name || user?.companyName || `${user?.firstName || ''} ${user?.lastName || ''}`
  ).trim() || '-';

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggle = (key) => {
    setSettings((current) => ({
      ...current,
      [key]: !current[key]
    }));
  };

  const handleMaterialRateChange = (event) => {
    const { name, value } = event.target;
    setMaterialRates((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSave = async () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    try {
      await updateUserSettings({
        materialRates: {
          tenMmRate: Number(materialRates.tenMmRate || 0),
          twentyMmRate: Number(materialRates.twentyMmRate || 0),
          fortyMmRate: Number(materialRates.fortyMmRate || 0),
          sixtyMmRate: Number(materialRates.sixtyMmRate || 0),
          sixMmRate: Number(materialRates.sixMmRate || 0),
          fourMmRate: Number(materialRates.fourMmRate || 0),
          wmmRate: Number(materialRates.wmmRate || 0),
          gsbRate: Number(materialRates.gsbRate || 0),
          dustRate: Number(materialRates.dustRate || 0)
        }
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error(error?.message || 'Failed to save settings');
    }
  };

  const handleReset = async () => {
    setSettings(defaultSettings);
    setMaterialRates(defaultMaterialRates);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSettings));
    try {
      await updateUserSettings({
        materialRates: {
          tenMmRate: 0,
          twentyMmRate: 0,
          fortyMmRate: 0,
          sixtyMmRate: 0,
          sixMmRate: 0,
          fourMmRate: 0,
          wmmRate: 0,
          gsbRate: 0,
          dustRate: 0
        }
      });
      toast.success('Settings reset to default');
    } catch (error) {
      toast.error(error?.message || 'Failed to reset settings');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const landingPageLabel = landingPageOptions.find((item) => item.value === settings.defaultLandingPage)?.label || 'Home';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-[2rem]">Settings</h1>
          <p className="mt-2 max-w-2xl text-base text-slate-600">
            Manage your application preferences and account settings from one place.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <SettingCard
              title="Account"
              description="Your signed-in business profile details."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            >
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 xl:grid-cols-5">
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Company</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{displayName}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Email</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{user?.email || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">Phone</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{user?.mobile || user?.phone || '-'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-3">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">State</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">{user?.state || user?.address?.state || '-'}</p>
                  </div>
                <div className="rounded-xl bg-slate-50 px-3 py-3">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">District</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{user?.district || '-'}</p>
                </div>
              </div>
              </div>
            </SettingCard>

            <SettingCard
              title="Session"
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>}
            >
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Logout
              </button>
            </SettingCard>
          </div>

          <div className="space-y-6">
            <SettingCard
              title="Crusher Material Rates"
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-12V4m0 16v-2m8-6a8 8 0 11-16 0 8 8 0 0116 0z" /></svg>}
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {materialRateFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="mb-1 block text-[13px] font-medium text-slate-700">{field.label}</span>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name={field.key}
                        value={materialRates[field.key]}
                        onChange={handleMaterialRateChange}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-16 text-[13px] font-semibold text-slate-800 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                        placeholder="0"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Rs / Ton</span>
                    </div>
                  </label>
                ))}
              </div>
            </SettingCard>

            <SettingCard
              title="Actions"
              description="Save or reset your local preferences and account settings."
              icon={<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0A8.003 8.003 0 015.06 15m14.36 0H15" /></svg>}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Save Settings
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Reset Settings
                </button>
              </div>
            </SettingCard>
          </div>
        </div>
      </div>
    </div>
  );
}
