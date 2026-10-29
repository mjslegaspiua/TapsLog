/**
 * StudentSchedule.jsx — Student POV: Timetable (Sleek White UI)
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_SCHEDULES } from '../../lib/mockData';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function StudentSchedule() {
  const user = useAppStore((s) => s.user);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const filteredSchedules =
    selectedDay === 'ALL'
      ? MOCK_SCHEDULES
      : MOCK_SCHEDULES.filter((item) => item.day_of_week === selectedDay);

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="sticky -top-4 z-30 -mx-4 -mt-4 flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 pb-3 pt-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Enrolled Timetable</h1>
            <p className="text-xs text-slate-500">{user?.program || 'BSIT-3A'}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedDay === 'ALL'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedDay === day
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filteredSchedules.map((item) => (
          <div key={item.session_id} className="card space-y-2.5 p-4 transition-all hover:border-slate-300">
            <div className="flex items-center justify-between">
              <span className="rounded border border-blue-100 bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-brand-700">
                {item.code}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {item.day_of_week}
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">{item.subject}</h3>
              <p className="text-[11px] text-slate-500">{item.section}</p>
            </div>
            <div className="space-y-1 border-t border-slate-100 pt-1 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-brand-600" />
                <span>{item.day_of_week}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-brand-600" />
                <span>{item.start_time} – {item.end_time}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                <span>{item.room}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-brand-600" />
                <span>{item.instructor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredSchedules.length === 0 && (
        <p className="text-center text-xs text-slate-400">
          No classes are listed for {selectedDay}.
        </p>
      )}
    </div>
  );
}
