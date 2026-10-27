/**
 * SchedulePanel — Column 3 of desktop dashboard (Sleek White UI)
 */
import { useAppStore } from '../../store/useAppStore';
import { useSchedule } from '../../hooks/useSchedule';
import { StatusBadge } from '../../components/shared/StatusBadge';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { Calendar, Clock, MapPin, RefreshCw, Loader2, ChevronRight } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs shadow-md">
        <p className="text-slate-500 font-medium">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function SchedulePanel() {
  const user = useAppStore((s) => s.user);
  const allSchedules = useAppStore((s) => s.allSchedules);
  const currentClassStore = useAppStore((s) => s.currentClass);
  const nextClassStore = useAppStore((s) => s.nextClass);
  const attendanceFeed = useAppStore((s) => s.attendanceFeed);
  const setActiveSession = useAppStore((s) => s.setActiveSession);

  const { loading, refresh } = useSchedule(user?.faculty_id || user?.id || user?.name);

  // STRICT: Filter subjects only taught by this professor
  const teacherClasses = user?.name && user?.role === 'teacher'
    ? allSchedules.filter(
        (s) =>
          s.instructor.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(s.instructor.toLowerCase())
      )
    : allSchedules;

  const currentClass =
    currentClassStore && teacherClasses.some((s) => s.session_id === currentClassStore.session_id)
      ? currentClassStore
      : teacherClasses[0] || null;

  const nextClass =
    nextClassStore && teacherClasses.some((s) => s.session_id === nextClassStore.session_id)
      ? nextClassStore
      : teacherClasses.find((s) => s.session_id !== currentClass?.session_id) || null;

  const presentCount = attendanceFeed.filter((e) => e.status === 'PRESENT').length;
  const lateCount = attendanceFeed.filter((e) => e.status === 'LATE').length;

  const pieData = [
    { name: 'Present', value: presentCount, color: '#10b981' },
    { name: 'Late', value: lateCount, color: '#f59e0b' },
  ].filter((d) => d.value > 0);

  const barData = DAYS.map((day) => {
    const count = teacherClasses.filter((s) => s.day_of_week?.startsWith(day)).length;
    return { day, Classes: count };
  });

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-white px-4 py-3.5 space-y-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-600" />
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">My Schedule</h2>
        </div>
        <button onClick={refresh} disabled={loading} className="text-slate-400 hover:text-slate-700 p-1">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Current / Next Class Pills */}
      <div className="space-y-2">
        {currentClass && (
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-brand-700 uppercase">Now</span>
              <p className="text-xs font-bold text-slate-900 leading-tight">{currentClass.subject}</p>
              <p className="text-[11px] text-slate-500">{currentClass.section}</p>
            </div>
            <button
              onClick={() => setActiveSession(currentClass)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
            >
              Select <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {nextClass && (
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
            <div>
              <p className="text-slate-400 text-[10px]">Next</p>
              <p className="font-semibold text-slate-800">{nextClass.subject}</p>
              <p className="text-[10px] text-slate-500">{nextClass.start_time}</p>
            </div>
            <button
              onClick={() => setActiveSession(nextClass)}
              className="text-[11px] text-slate-600 hover:text-slate-900"
            >
              Preload
            </button>
          </div>
        )}
      </div>

      {/* Weekly Load Chart */}
      <div className="p-3 border border-slate-200 rounded-xl space-y-2">
        <p className="text-[10px] font-semibold text-slate-400 uppercase">Weekly Load</p>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -32, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Classes" radius={[3, 3, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.day === today ? '#2563eb' : '#93c5fd'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Class List */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase">My Classes ({teacherClasses.length})</p>
        {teacherClasses.map((cls, i) => (
          <button
            key={i}
            onClick={() => setActiveSession(cls)}
            className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-white text-left transition-all"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-800 truncate">{cls.subject}</p>
              <StatusBadge status={cls.status} />
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {cls.day_of_week} · {cls.start_time} - {cls.end_time} · {cls.section}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
