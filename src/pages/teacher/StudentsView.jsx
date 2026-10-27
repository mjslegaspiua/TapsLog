/**
 * StudentsView.jsx — Teacher POV: Student Directory (Sleek White UI)
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useAttendance } from '../../hooks/useAttendance';
import { Users, Search, ScanLine, GraduationCap, IdCard } from 'lucide-react';

export function StudentsView() {
  const enrolledStudents = useAppStore((s) => s.enrolledStudents);
  const activeSession = useAppStore((s) => s.activeSession);
  const { submitScan, loading } = useAttendance();
  const [search, setSearch] = useState('');

  const filteredStudents = enrolledStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_id.toLowerCase().includes(search.toLowerCase()) ||
      s.card_uid.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimulateScanForStudent = (student) => {
    if (!activeSession) return;
    submitScan({
      session_id: activeSession.session_id,
      card_uid: student.card_uid,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">Enrolled Students</h1>
            <p className="text-xs text-slate-500">Student roster & NFC cards</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student..."
            className="input-field pl-9 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredStudents.map((student) => (
          <div
            key={student.student_id}
            className="card p-4 border hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {student.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-xs">{student.name}</h3>
                    <p className="text-[11px] text-slate-500">{student.program}</p>
                  </div>
                </div>

                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {student.attendance_rate}%
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-brand-600" /> ID:</span>
                  <span className="font-mono text-slate-700 font-medium">{student.student_id}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span className="flex items-center gap-1"><IdCard className="w-3 h-3 text-brand-600" /> Card UID:</span>
                  <span className="font-mono text-brand-700 font-medium">{student.card_uid}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100">
              <button
                onClick={() => handleSimulateScanForStudent(student)}
                disabled={loading || !activeSession}
                className="w-full btn-ghost text-xs py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 disabled:opacity-40"
              >
                <ScanLine className="w-3 h-3 text-brand-600" /> Tap Card
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
