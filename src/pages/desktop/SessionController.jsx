/**
 * SessionController — Column 2 of desktop dashboard (Sleek White UI)
 */
import { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAttendance } from '../../hooks/useAttendance';
import { activateSession, closeSession, triggerAutoAbsent } from '../../api/teacherService';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatTime, cn } from '../../lib/utils';
import { Play, Square, UserX, ScanLine, Loader2, Zap, Clock, BookOpen } from 'lucide-react';

export function SessionController() {
  const [manualUID, setManualUID] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const user = useAppStore((s) => s.user);
  const allSchedules = useAppStore((s) => s.allSchedules);
  const activeSession = useAppStore((s) => s.activeSession);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const addToast = useAppStore((s) => s.addToast);
  const lastScan = useAppStore((s) => s.lastScan);

  const { submitScan, loading: scanLoading } = useAttendance();

  // STRICT: Teacher only accesses their own subjects
  const teacherClasses = user?.name && user?.role === 'teacher'
    ? allSchedules.filter(
        (s) =>
          s.instructor.toLowerCase().includes(user.name.toLowerCase()) ||
          user.name.toLowerCase().includes(s.instructor.toLowerCase())
      )
    : allSchedules;

  // Auto-align activeSession to teacher's own class if currently mismatched
  useEffect(() => {
    if (user?.role === 'teacher' && teacherClasses.length > 0) {
      const isOwned = activeSession && teacherClasses.some((c) => c.session_id === activeSession.session_id);
      if (!isOwned) {
        setActiveSession(teacherClasses[0]);
      }
    }
  }, [user?.role, teacherClasses.length]);

  const handleActivate = async () => {
    if (!activeSession?.session_id) return;
    setActionLoading('activate');
    try {
      await activateSession(activeSession.session_id);
      useAppStore.setState({
        activeSession: { ...activeSession, status: 'ACTIVE' },
        sessionStatus: 'ACTIVE',
      });
      addToast({ message: 'Session activated', type: 'success' });
    } catch (err) {
      addToast({ message: err.friendlyMessage || 'Activation failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async () => {
    if (!activeSession?.session_id) return;
    setActionLoading('close');
    try {
      await closeSession(activeSession.session_id);
      useAppStore.setState({
        activeSession: { ...activeSession, status: 'CLOSED' },
        sessionStatus: 'CLOSED',
      });
      addToast({ message: 'Session closed', type: 'info' });
    } catch (err) {
      addToast({ message: err.friendlyMessage || 'Close failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoAbsent = async () => {
    if (!activeSession?.session_id) return;
    setActionLoading('absent');
    try {
      await triggerAutoAbsent(activeSession.session_id);
      addToast({ message: 'Auto-absent executed', type: 'info' });
    } catch (err) {
      addToast({ message: err.friendlyMessage || 'Action failed', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleManualScan = async (e) => {
    e.preventDefault();
    if (!manualUID.trim() || !activeSession?.session_id) return;
    try {
      await submitScan({ session_id: activeSession.session_id, card_uid: manualUID.trim() });
      setManualUID('');
    } catch {}
  };

  return (
    <div className="flex flex-col h-full bg-white px-4 py-3.5 space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-brand-600" />
        <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Session Control</h2>
      </div>

      {/* Teacher's Subject Quick Switcher */}
      {teacherClasses.length > 1 && (
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Select Assigned Subject
          </label>
          <select
            value={activeSession?.session_id || ''}
            onChange={(e) => {
              const selected = teacherClasses.find((c) => c.session_id === e.target.value);
              if (selected) {
                setActiveSession(selected);
                addToast({ message: `Switched to ${selected.subject}`, type: 'info' });
              }
            }}
            className="input-field text-xs py-1.5 font-medium cursor-pointer bg-white"
          >
            {teacherClasses.map((cls) => (
              <option key={cls.session_id} value={cls.session_id}>
                {cls.subject} ({cls.day_of_week} {cls.start_time})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Active Session Info */}
      {activeSession ? (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 leading-tight">{activeSession.subject}</p>
              <p className="text-[11px] text-slate-500">{activeSession.section} · {activeSession.room}</p>
            </div>
            <StatusBadge status={sessionStatus === 'ACTIVE' ? 'ACTIVE' : activeSession.status} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {activeSession.start_time} – {activeSession.end_time}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl text-xs">
          Select class from schedule
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2">
        {sessionStatus !== 'ACTIVE' ? (
          <button
            onClick={handleActivate}
            disabled={!activeSession || actionLoading === 'activate'}
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

        <button
          onClick={handleAutoAbsent}
          disabled={!activeSession || actionLoading === 'absent'}
          className="w-full flex items-center gap-1.5 justify-center px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all"
        >
          {actionLoading === 'absent' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <><UserX className="w-3.5 h-3.5" /> Auto-Absent Unchecked</>
          )}
        </button>
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
