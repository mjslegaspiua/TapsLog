/**
 * StudentsView.jsx — Teacher POV: Section Directory and Student Attendance
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MOCK_STUDENT_SECTIONS } from '../../lib/mockData';
import {
  Users,
  Search,
  GraduationCap,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export function StudentsView() {
  const enrolledStudents = useAppStore((s) => s.enrolledStudents);
  const [selectedSection, setSelectedSection] = useState(null);
  const [search, setSearch] = useState('');

  const sectionStudents = selectedSection
    ? enrolledStudents.filter((student) => student.section === selectedSection)
    : [];
  const filteredStudents = sectionStudents.filter((student) =>
    [student.name, student.student_id, student.card_uid]
      .some((value) => value.toLowerCase().includes(search.toLowerCase()))
  );
  const averageAttendance = sectionStudents.length
    ? Math.round(
        sectionStudents.reduce((total, student) => total + student.attendance_rate, 0) /
          sectionStudents.length
      )
    : 0;

  const handleOpenSection = (section) => {
    setSelectedSection(section);
    setSearch('');
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setSearch('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          {selectedSection ? (
            <button
              onClick={handleBackToSections}
              aria-label="Back to sections"
              className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 hover:bg-blue-200 flex items-center justify-center shrink-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-brand-700 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
          )}
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {selectedSection || 'Student Sections'}
            </h1>
            <p className="text-xs text-slate-500">
              {selectedSection
                ? `${sectionStudents.length} students · ${averageAttendance}% average attendance`
                : 'Select a section to view its students and attendance stats'}
            </p>
          </div>
        </div>

        {selectedSection && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search student..."
              className="input-field pl-9 text-xs py-1.5"
            />
          </div>
        )}
      </div>

      {!selectedSection ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {MOCK_STUDENT_SECTIONS.map((section) => {
            const students = enrolledStudents.filter((student) => student.section === section);
            const sectionAverage = students.length
              ? Math.round(
                  students.reduce((total, student) => total + student.attendance_rate, 0) /
                    students.length
                )
              : 0;

            return (
              <button
                key={section}
                onClick={() => handleOpenSection(section)}
                className="card p-4 text-left border hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-700 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900">{section}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {students.length} {students.length === 1 ? 'student' : 'students'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 shrink-0 mt-1" />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <TrendingUp className="w-3.5 h-3.5 text-brand-600" />
                    Average attendance
                  </span>
                  <span className="font-semibold text-emerald-700">{sectionAverage}%</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3.5">
              <p className="text-[11px] text-slate-500">Enrolled students</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{sectionStudents.length}</p>
            </div>
            <div className="card p-3.5">
              <p className="text-[11px] text-slate-500">Average attendance</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{averageAttendance}%</p>
            </div>
          </div>

          {filteredStudents.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredStudents.map((student) => (
                <div
                  key={student.student_id}
                  className="card p-4 border hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name[0]}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 text-xs truncate">{student.name}</h3>
                          <p className="text-[11px] text-slate-500">{student.section}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        {student.attendance_rate}% attendance
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${student.attendance_rate}%` }}
                      />
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between text-slate-500 gap-2">
                        <span className="flex items-center gap-1 shrink-0">
                          <GraduationCap className="w-3 h-3 text-brand-600" /> ID:
                        </span>
                        <span className="font-mono text-slate-700 font-medium">{student.student_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-slate-400 py-8">
              {sectionStudents.length
                ? 'No students match your search.'
                : 'No students are enrolled in this section yet.'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
