/**
 * SessionController — Column 2 of desktop dashboard (Sleek White UI)
 */
import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAttendance } from '../../hooks/useAttendance';
import { activateSession, closeSession } from '../../api/teacherService';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatTime } from '../../lib/utils';
import { Play, Square, ScanLine, Loader2, Zap, Clock } from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseTime(value) {
  const match = value?.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return { hour, minute: Number(match[2]) };
}

function getScheduledClass(classes, now) {
  const weekday = WEEKDAYS[now.getDay()];
  return classes.find((cls) => {
    if (cls.day_of_week !== weekday) return false;
    const start = parseTime(cls.start_time);
    const end = parseTime(cls.end_time);
    if (!start || !end) return false;

    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }) || null;
}

export function SessionController() {
  const [manualUID, setManualUID] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const user = useAppStore((s) => s.user);
  const allSchedules = useAppStore((s) => s.allSchedules);
  const activeSession = useAppStore((s) => s.activeSession);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const addToast = useAppStore((s) => s.addToast);
  const addNotification = useAppStore((s) => s.addNotification);
  const lastScan = useAppStore((s) => s.lastScan);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const { submitScan, loading: scanLoading } = useAttendance();

  // STRICT: Teacher only accesses their own subjects
  const teacherClasses = useMemo(() => user?.name && user?.role === 'teacher'
    ? allSchedules.filter(
        (s) =>
          s.instructor.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(s.instructor.toLowerCase())
      )
    : allSchedules, [allSchedules, user]);
  const scheduledClass = useMemo(
    () => getScheduledClass(teacherClasses, currentTime),
    [teacherClasses, currentTime]
  );
  const sessionClass = sessionStatus === 'ACTIVE' ? activeSession : scheduledClass;

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (sessionStatus === 'ACTIVE') return;
    if (activeSession?.session_id !== scheduledClass?.session_id) {
      setActiveSession(scheduledClass ? { ...scheduledClass, status: 'PENDING' } : null);
    }
  }, [activeSession?.session_id, scheduledClass, sessionStatus, setActiveSession]);

  const handleActivate = async () => {
    if (!sessionClass?.session_id) return;
    setActionLoading('activate');
    try {
      await activateSession(sessionClass.session_id);
      useAppStore.setState({
        activeSession: { ...sessionClass, status: 'ACTIVE' },
        sessionStatus: 'ACTIVE',
      });
      addToast({ message: 'Session activated', type: 'success' });
      addNotification({ message: `${sessionClass.subject} session started`, type: 'success' });
    } catch (err) {
      addToast({ message: err.friendlyMessage || 'Activation failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (!sessionClass?.session_id) return;
    setActionLoading('close');
    try {
      await closeSession(sessionClass.session_id);
      useAppStore.setState({
        activeSession: { ...sessionClass, status: 'CLOSED' },
        sessionStatus: 'CLOSED',
      });
      addToast({ message: 'Session closed', type: 'info' });
      addNotification({ message: `${sessionClass.subject} session ended`, type: 'info' });
    } catch (err) {
      addToast({ message: err.friendlyMessage || 'Close failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!manualUID.trim() || !sessionClass?.session_id) return;
    try {
      await submitScan({ session_id: sessionClass.session_id, card_uid: manualUID.trim() });
      setManualUID('');
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 py-3.5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-brand-600" />
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Session Control</h2>
      </div>

      {/* Active Session Info */}
      {sessionClass ? (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{sessionClass.subject}</p>
              <p className="text-[11px] text-slate-500">{sessionClass.section} · {sessionClass.room}</p>
            </div>
            <StatusBadge status={sessionStatus === 'ACTIVE' ? 'ACTIVE' : sessionClass.status} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {sessionClass.start_time} – {sessionClass.end_time}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
          No class is scheduled for this time.
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {sessionStatus !== 'ACTIVE' ? (
          <button
            onClick={handleActivate}
            disabled={!sessionClass || actionLoading === 'activate'}
            className="btn-primary w-full text-xs font-semibold py-2.5"
          >
            {actionLoading === 'activate' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <><Play className="w-3.5 h-3.5" /> Start Session</>
            )}
          </button>
        ) : (
          <button
            onClick={handleClose}
            disabled={actionLoading === 'close'}
            className="btn-danger w-full text-xs font-semibold py-2.5"
          >
            {actionLoading === 'close' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <><Square className="w-3.5 h-3.5" /> End Session</>
            )}
          </button>
        )}

      </div>

      {/* Last Tap */}
      {lastScan && (
        <div className="p-3 bg-white border border-slate-200 rounded-xl animate-slide-up space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">Recent Tap</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                {lastScan.student?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 leading-tight">{lastScan.student}</p>
                <p className="text-[10px] text-slate-400 font-mono">{formatTime(lastScan.scanned_at)}</p>
              </div>
            </div>
            <StatusBadge status={lastScan.status || lastScan.action} />
          </div>
        </div>
      )}

      {/* Manual Input */}
      <div className="pt-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5">Manual UID Entry</p>
        <form onSubmit={handleManualScan} className="flex gap-1.5">
          <input
            type="text"
            value={manualUID}
            onChange={(e) => setManualUID(e.target.value)}
            placeholder="NFC-8A2F-1101"
            className="input-field font-mono text-xs py-1.5"
            disabled={sessionStatus !== 'ACTIVE' || scanLoading}
          />
          <button
            type="submit"
            disabled={!manualUID.trim() || sessionStatus !== 'ACTIVE' || scanLoading}
            className="btn-primary text-xs px-3 py-1.5 shrink-0"
          >
            {scanLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
