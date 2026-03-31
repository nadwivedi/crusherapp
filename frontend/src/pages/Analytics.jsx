import HomeAnalyticsPanel from '../components/HomeAnalyticsPanel';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[98%] px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white hover:bg-slate-100 rounded-xl shadow-sm border border-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Analytics Dashboard</h1>
        </div>
        
        {/* Render the full-width analytics panel */}
        <div className="pb-8">
            <HomeAnalyticsPanel />
        </div>
      </div>
    </div>
  );
}
