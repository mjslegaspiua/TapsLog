/**
 * ScheduleView.jsx — Teacher POV: Class Schedule Manager (Sleek White UI)
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Calendar, Clock, MapPin, Users, Play, Square } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ScheduleView() {
  const user = useAppStore((s) => s.user);
  const allSchedules = useAppStore((s) => s.allSchedules);
  const activeSession = useAppStore((s) => s.activeSession);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const setSessionStatus = useAppStore((s) => s.setSessionStatus);
  const addToast = useAppStore((s) => s.addToast);

  const [selectedDay, setSelectedDay] = useState('ALL');

  // STRICT: Teachers can ONLY view & manage their own subjects
  const teacherClasses = user?.name
    ? allSchedules.filter(
        (s) =>
          s.instructor.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(s.instructor.toLowerCase())
      )
    : allSchedules;

  const filteredSchedules =
    selectedDay === 'ALL'
      ? teacherClasses
      : teacherClasses.filter((s) => s.day_of_week === selectedDay);

  const handleSelectClass = (cls) => {
    setActiveSession(cls);
    addToast({ message: `Selected ${cls.subject}`, type: 'info' });
  };

  const handleActivateToggle = (cls) => {
    if (activeSession?.session_id === cls.session_id && sessionStatus === 'ACTIVE') {
      setSessionStatus('CLOSED');
      addToast({ message: 'Session closed', type: 'info' });
    } else {
      setActiveSession(cls);
      setSessionStatus('ACTIVE');
      addToast({ message: `Session active for ${cls.subject}`, type: 'success' });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {user?.name ? `${user.name} — My Classes` : 'Faculty Schedule'}
            </h1>
            <p className="text-xs text-slate-500">
              Assigned subjects only ({teacherClasses.length} weekly sessions)
            </p>
          </div>
        </div>

        {/* Day Pills */}
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

      {filteredSchedules.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          No available classes on this day.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredSchedules.map((cls) => {
          const isSelected = activeSession?.session_id === cls.session_id;
          const isLive = isSelected && sessionStatus === 'ACTIVE';

          return (
            <div
              key={cls.session_id}
              className={`card p-4 border flex flex-col justify-between transition-all ${
                isLive
                  ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
                  : isSelected
                  ? 'border-blue-300 bg-blue-50/20 shadow-sm'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-brand-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {cls.day_of_week}
                  </span>
                  <StatusBadge status={isLive ? 'ACTIVE' : cls.status} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{cls.subject}</h3>
                  <p className="text-xs text-slate-500">{cls.section}</p>
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    <span>{cls.start_time} – {cls.end_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{cls.room || 'Room TBA'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>{cls.total_students || 15} Students</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSelectClass(cls)}
                  className={`btn-ghost text-xs px-2.5 py-1.5 flex-1 border border-slate-200 ${
                    isSelected ? 'bg-blue-50 text-brand-700 border-blue-200' : ''
                  }`}
                >
                  {isSelected ? 'Active' : 'Select'}
                </button>

                <button
                  onClick={() => handleActivateToggle(cls)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1 transition-all ${
                    isLive
                      ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm'
                  }`}
                >
                  {isLive ? <><Square className="w-3 h-3" /> End</> : <><Play className="w-3 h-3" /> Start</>}
                </button>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
