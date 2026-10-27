/**
 * StudentAccount.jsx — Student POV: Account & Digital ID (Sleek White UI)
 */
import { useAppStore } from '../../store/useAppStore';
import { IdCard, ShieldCheck, Wifi } from 'lucide-react';

export function StudentAccount() {
  const user = useAppStore((s) => s.user);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-2xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
        <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
          <IdCard className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900">Student Account</h1>
          <p className="text-xs text-slate-500">Digital ID & semester metrics</p>
        </div>
      </div>

      {/* Digital Student Card */}
      <div className="card p-6 bg-gradient-to-br from-blue-700 via-brand-600 to-indigo-800 text-white rounded-2xl shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/20">
          <div>
            <p className="text-xs font-bold tracking-wider">TAPSLOG UNIVERSITY</p>
            <p className="text-[10px] text-blue-200">STUDENT IDENTITY</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/20 text-white">
            <Wifi className="w-3 h-3" /> NFC Active
          </span>
        </div>

        <div className="pt-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center font-bold text-2xl text-white shrink-0">
            {user?.name?.[0] || 'S'}
          </div>

          <div className="space-y-0.5 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{user?.name || 'Student Name'}</h2>
            <p className="text-xs text-blue-200">{user?.program || 'BSIT-3A'} · {user?.year || '3rd Year'}</p>
            <p className="text-xs text-blue-100 font-mono">ID: {user?.student_id || '2023-10492'}</p>
            <p className="text-xs text-blue-200 font-mono">UID: {user?.card_uid || 'NFC-8A2F-1101'}</p>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-200">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Enrolled Status Verified</span>
          <span className="font-mono">AY 2026-2027</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center border-emerald-100 bg-emerald-50/40">
          <p className="text-2xl font-bold text-emerald-700">{user?.attendance_rate || 96}%</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Attendance</p>
        </div>

        <div className="card p-3 text-center border-blue-100 bg-blue-50/40">
          <p className="text-2xl font-bold text-brand-700">42</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Classes Attended</p>
        </div>

        <div className="card p-3 text-center border-amber-100 bg-amber-50/40">
          <p className="text-2xl font-bold text-amber-700">2</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Late Taps</p>
        </div>
      </div>
    </div>
  );
}
