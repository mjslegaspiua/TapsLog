/**
 * StudentSettings.jsx — Student POV: Preferences (Sleek White UI)
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Settings, Bell, Volume2, LogOut } from 'lucide-react';

export function StudentSettings() {
  const clearUser = useAppStore((s) => s.clearUser);
  const addToast = useAppStore((s) => s.addToast);

  const [soundAlerts, setSoundAlerts] = useState(true);
  const [classAlerts, setClassAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    addToast({ message: 'Preferences saved', type: 'success' });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
          <Settings className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">Student Settings</h1>
          <p className="text-xs text-slate-500">Preferences & account</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Class Reminders</p>
              <p className="text-[11px] text-slate-400">Notify 10 mins before class starts</p>
            </div>
            <input
              type="checkbox"
              checked={classAlerts}
              onChange={(e) => setClassAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-800">Tap Chime Audio</p>
              <p className="text-[11px] text-slate-400">Play chime on successful scan</p>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3">
          <button type="submit" className="btn-primary text-xs px-5 py-2">
            Save
          </button>

          <button
            type="button"
            onClick={clearUser}
            className="btn-danger text-xs px-4 py-2"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </form>
    </div>
  );
}
