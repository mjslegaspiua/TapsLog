/**
 * MobileScan.jsx — Teacher Mobile NFC Scanner (Sleek White UI)
 */
import { useState } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { useAppStore } from '../../store/useAppStore';
import { ScanLine, Loader2 } from 'lucide-react';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { formatTime } from '../../lib/utils';

export function MobileScan() {
  const [cardUID, setCardUID] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const { submitScan, loading } = useAttendance();
  const activeSession = useAppStore((s) => s.activeSession);
  const sessionStatus = useAppStore((s) => s.sessionStatus);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!cardUID.trim() || !activeSession?.session_id) return;
    try {
      const result = await submitScan({
        session_id: activeSession.session_id,
        card_uid: cardUID.trim(),
      });
      setLastResult(result);
      setCardUID('');
    } catch {
      setLastResult(null);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">NFC Scanner</h2>
        <p className="text-xs text-slate-500">Tap card or enter UID</p>
      </div>

      {/* Tap Target Zone */}
      <div className="card p-8 flex flex-col items-center justify-center gap-3 text-center border-dashed border-2 border-slate-200">
        <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-600">
          <ScanLine className="w-8 h-8" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-800">
            {sessionStatus === 'ACTIVE' ? 'Ready for NFC Taps' : 'Session Inactive'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {sessionStatus === 'ACTIVE' ? 'Hold student card near phone' : 'Start class session first'}
          </p>
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="card p-3 animate-slide-up flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">{lastResult.student}</p>
            <p className="text-[10px] text-slate-400 font-mono">{formatTime(lastResult.scanned_at)}</p>
          </div>
          <StatusBadge status={lastResult.status || lastResult.action} />
        </div>
      )}

      {/* Manual Entry */}
      <form onSubmit={handleScan} className="space-y-2">
        <p className="section-header">Manual Entry</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={cardUID}
            onChange={(e) => setCardUID(e.target.value)}
            placeholder="NFC-8A2F-1101"
            className="input-field font-mono text-xs"
            disabled={!activeSession || loading}
          />
          <button
            type="submit"
            disabled={!cardUID.trim() || !activeSession || loading}
            className="btn-primary text-xs px-4 shrink-0 font-medium"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Scan'}
          </button>
        </div>
      </form>
    </div>
  );
}
