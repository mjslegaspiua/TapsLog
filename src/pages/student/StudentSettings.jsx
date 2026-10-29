/**
 * StudentSettings.jsx — Student POV: Preferences (Sleek White UI)
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Settings, LogOut } from 'lucide-react';

function getPreferenceKey(user) {
  return `tapslog_student_preferences_${user?.student_id || user?.id || user?.name || 'student'}`;
}

function readPreferences(user) {
  const prefix = getPreferenceKey(user);
  return {
    classAlerts: localStorage.getItem(`${prefix}_classAlerts`) !== 'false',
    reminderMinutes: localStorage.getItem(`${prefix}_reminderMinutes`) || '10',
    soundAlerts: localStorage.getItem(`${prefix}_soundAlerts`) !== 'false',
  };
}

export function StudentSettings() {
  const user = useAppStore((s) => s.user);
  const clearUser = useAppStore((s) => s.clearUser);
  const addToast = useAppStore((s) => s.addToast);
  const [preferences, setPreferences] = useState(() => readPreferences(user));

  const handleSave = (e) => {
    e.preventDefault();
    const prefix = getPreferenceKey(user);
    try {
      localStorage.setItem(`${prefix}_classAlerts`, String(preferences.classAlerts));
      localStorage.setItem(`${prefix}_reminderMinutes`, preferences.reminderMinutes);
      localStorage.setItem(`${prefix}_soundAlerts`, String(preferences.soundAlerts));
      addToast({ message: 'Preferences saved', type: 'success' });
    } catch (error) {
      console.error('[StudentSettings] Unable to save preferences:', error);
      addToast({ message: 'Unable to save preferences. Please try again.', type: 'error' });
    }
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
              <p className="text-[11px] text-slate-400">Remind me about my next scheduled class</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.classAlerts}
              onChange={(e) => setPreferences((current) => ({ ...current, classAlerts: e.target.checked }))}
              className="w-4 h-4 text-brand-600 rounded"
            />
          </div>

          {preferences.classAlerts && (
            <label className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span>
                <span className="block text-xs font-semibold text-slate-800">Remind me before class</span>
                <span className="block text-[11px] text-slate-400">Choose how many minutes ahead</span>
              </span>
              <select
                value={preferences.reminderMinutes}
                onChange={(e) => setPreferences((current) => ({ ...current, reminderMinutes: e.target.value }))}
                className="input-field w-auto min-w-32 text-xs"
              >
                {[5, 10, 15, 30, 45, 60].map((minutes) => (
                  <option key={minutes} value={minutes}>{minutes} minutes</option>
                ))}
              </select>
            </label>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-800">Tap Chime Audio</p>
              <p className="text-[11px] text-slate-400">Play chime on successful scan</p>
            </div>
            <input
              type="checkbox"
              checked={preferences.soundAlerts}
              onChange={(e) => setPreferences((current) => ({ ...current, soundAlerts: e.target.checked }))}
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
