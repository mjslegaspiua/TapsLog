/**
 * ScheduleView.jsx — Teacher POV: Class Schedule Manager (Sleek White UI)
 */
import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { useSchedule } from '../../hooks/useSchedule';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Play, Square, RefreshCw } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CLASS_SECTIONS = [
  'BSIT - WMD 3A',
  'BSIT - WMD 3B',
  'BSIT - DA 3A',
  'BSIT - DA 3B',
];
const AVAILABLE_SECTION = 'BSIT - WMD 3A';

function isAvailableSectionSchedule(cls) {
  const section = cls.section?.toUpperCase().replace(/\s+/g, '');
  return section === 'BSIT-3A' || section === 'BSIT-WMD3A';
}

function parseScheduleTime(value) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return hour * 60 + Number(match[2]);
}

function isWithinScheduleTime(cls, now) {
  const start = parseScheduleTime(cls.start_time);
  const end = parseScheduleTime(cls.end_time);
  if (start === null || end === null) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return currentMinutes >= start && currentMinutes < end;
}

export function ScheduleView() {
  const user = useAppStore((s) => s.user);
  const allSchedules = useAppStore((s) => s.allSchedules);
  const activeSession = useAppStore((s) => s.activeSession);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const setSessionStatus = useAppStore((s) => s.setSessionStatus);
  const addToast = useAppStore((s) => s.addToast);
  const addNotification = useAppStore((s) => s.addNotification);
  const { loading: refreshing, error: scheduleError, refresh } = useSchedule(
    user?.faculty_id || user?.id || user?.name
  );

  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedSection, setSelectedSection] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const today = now.toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // STRICT: Teachers can ONLY view & manage their own subjects
  const teacherClasses = user?.name
    ? allSchedules.filter(
        (s) =>
          s.instructor.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(s.instructor.toLowerCase())
      )
    : allSchedules;

  const sectionSchedules =
    selectedSection === AVAILABLE_SECTION
      ? teacherClasses.filter(isAvailableSectionSchedule)
      : [];

  const filteredSchedules =
    selectedDay === 'ALL'
      ? sectionSchedules
      : sectionSchedules.filter((s) => s.day_of_week === selectedDay);

  const handleSelectClass = (cls) => {
    setActiveSession(cls);
    addToast({ message: `Selected ${cls.subject}`, type: 'info' });
  };

  const handleActivateToggle = (cls) => {
    if (activeSession?.session_id === cls.session_id && sessionStatus === 'ACTIVE') {
      setSessionStatus('CLOSED');
      addToast({ message: 'Session closed', type: 'info' });
      addNotification({ message: `${cls.subject} session ended`, type: 'info' });
    } else if (cls.day_of_week !== today || !isWithinScheduleTime(cls, now)) {
      addToast({
        message: `This class can only be started on ${cls.day_of_week} from ${cls.start_time} to ${cls.end_time}`,
        type: 'error',
      });
    } else {
      setActiveSession(cls);
      setSessionStatus('ACTIVE');
      addToast({ message: `Session active for ${cls.subject}`, type: 'success' });
      addNotification({ message: `${cls.subject} session started`, type: 'success' });
    }
  };

  const renderClassCard = (cls) => {
    const isScheduledToday = cls.day_of_week === today;
    const isSelected = isScheduledToday && activeSession?.session_id === cls.session_id;
    const isLive = isSelected && sessionStatus === 'ACTIVE';
    const canStartNow = isScheduledToday && isWithinScheduleTime(cls, now);
    const cannotStartNow = !isLive && !canStartNow;
    const displayedStatus = isLive
      ? 'ACTIVE'
      : cls.status === 'ACTIVE' && !canStartNow
      ? 'PENDING'
      : cls.status;
    const startUnavailableReason = !isScheduledToday
      ? `This class can only be started on ${cls.day_of_week}`
      : `This class can only be started from ${cls.start_time} to ${cls.end_time}`;

    return (
      <div
        key={cls.session_id}
        className={`card flex flex-col justify-between border p-3 transition-all ${
          isLive
            ? 'border-emerald-300 bg-emerald-50/30 shadow-sm'
            : isSelected
            ? 'border-blue-300 bg-blue-50/20 shadow-sm'
            : 'hover:border-slate-300'
        }`}
      >
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-1">
            {selectedDay === 'ALL' && (
              <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700">
                {cls.day_of_week}
              </span>
            )}
            <StatusBadge status={displayedStatus} />
          </div>

          <div>
            <h3 className="text-xs font-bold leading-snug text-slate-900">{cls.subject}</h3>
            <p className="text-[11px] text-slate-500">{cls.section}</p>
          </div>

          <div className="space-y-1 text-[11px] text-slate-500">
            <div className="flex items-start gap-1.5">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>{cls.start_time} – {cls.end_time}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>{cls.room || 'Room TBA'}</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
              <span>{cls.total_students || 15} Students</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-2.5">
          <button
            onClick={() => handleSelectClass(cls)}
            disabled={!isScheduledToday}
            title={!isScheduledToday ? `This class can only be selected on ${cls.day_of_week}` : undefined}
            className={`btn-ghost min-w-0 flex-1 border border-slate-200 px-2 py-1.5 text-[11px] ${
              isSelected ? 'border-blue-200 bg-blue-50 text-brand-700' : ''
            } ${!isScheduledToday ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {isSelected ? 'Active' : 'Select'}
          </button>

          <span
            className={`group relative inline-flex ${cannotStartNow ? 'cursor-not-allowed' : ''}`}
            title={cannotStartNow ? startUnavailableReason : undefined}
            tabIndex={cannotStartNow ? 0 : undefined}
          >
            {cannotStartNow && (
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-max max-w-56 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-[10px] font-medium text-white shadow-lg group-hover:block group-focus:block"
              >
                Unable to start: {startUnavailableReason}.
              </span>
            )}
            <button
              onClick={() => handleActivateToggle(cls)}
              disabled={cannotStartNow}
              className={`flex items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-all ${
                isLive
                  ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                  : cannotStartNow
                  ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                  : 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
              }`}
            >
              {isLive ? <><Square className="h-3 w-3" /> End</> : <><Play className="h-3 w-3" /> Start</>}
            </button>
          </span>
        </div>
      </div>
    );
  };

  if (!selectedSection) {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">Choose a class section</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a section to view its class schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CLASS_SECTIONS.map((section) => {
              const hasSchedule = section === AVAILABLE_SECTION;

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => {
                    setSelectedSection(section);
                    setSelectedDay('ALL');
                  }}
                  className="card flex min-h-32 items-center gap-4 border p-5 text-left transition hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  aria-label={`View ${section} schedule${hasSchedule ? '' : ' (not available yet)'}`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-brand-700">
                    <Calendar className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-900">{section}</span>
                    <span className={`mt-1 block text-xs ${hasSchedule ? 'text-brand-700' : 'text-slate-500'}`}>
                      {hasSchedule
                        ? `${teacherClasses.filter(isAvailableSectionSchedule).length} weekly sessions`
                        : 'No schedule available yet'}
                    </span>
                  </span>
                  <span className="text-slate-400" aria-hidden="true">›</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky -top-4 z-30 -mx-4 -mt-4 flex flex-col justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 pb-3 pt-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedSection(null)}
            aria-label="Back to class sections"
            title="Back to class sections"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {user?.name ? `${user.name} — My Classes` : 'Faculty Schedule'}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedSection}
              {selectedSection === AVAILABLE_SECTION
                ? ` · Assigned subjects only (${sectionSchedules.length} weekly sessions)`
                : ' · No schedule available yet'}
            </p>
          </div>
        </div>

        {/* Day Pills */}
        {selectedSection === AVAILABLE_SECTION && (
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
          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            aria-label="Refresh schedule"
            title="Refresh schedule"
            className="ml-1 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition hover:bg-slate-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        )}
      </div>

      {scheduleError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          Could not refresh schedule: {scheduleError}
        </p>
      )}

      {selectedSection !== AVAILABLE_SECTION ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No schedule is available for {selectedSection} yet.
        </p>
      ) : filteredSchedules.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {selectedDay === 'ALL' ? 'No classes are currently assigned.' : 'No available classes on this day.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchedules.map(renderClassCard)}
        </div>
      )}
    </div>
  );
}
