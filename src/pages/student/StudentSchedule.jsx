/**
 * StudentSchedule.jsx — Student POV: Timetable (Sleek White UI)
 */
import { useAppStore } from '../../store/useAppStore';
import { MOCK_SCHEDULES } from '../../lib/mockData';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

export function StudentSchedule() {
  const user = useAppStore((s) => s.user);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">Enrolled Timetable</h1>
          <p className="text-xs text-slate-500">{user?.program || 'BSIT-3A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MOCK_SCHEDULES.map((item) => (
          <div key={item.session_id} className="card p-4 space-y-2.5 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-brand-700 border border-blue-100">
                {item.code}
              </span>
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                {item.day_of_week}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900">{item.subject}</h3>
              <p className="text-[11px] text-slate-500">{item.section}</p>
            </div>

            <div className="space-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-600" />
                <span>{item.day_of_week}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>{item.start_time} – {item.end_time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                <span>{item.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>{item.instructor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">No classes are listed for Saturday or Sunday.</p>
    </div>
  );
}
