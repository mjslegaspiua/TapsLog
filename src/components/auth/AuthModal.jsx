/**
 * AuthModal.jsx — Sleek White & Blue Auth Portal
 * Features minimal text, crisp cards, NFC ID tap check, and role separation.
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  AUTHORIZED_FACULTY,
  MADALIPAY_TEACHER,
  ENROLLED_STUDENTS,
  MOCK_SCHEDULE_RESPONSE,
  getScheduleForTeacher,
  generateInitialFeed,
} from '../../lib/mockData';
import { playBeep } from '../../lib/utils';
import {
  ScanLine,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  KeyRound,
  IdCard,
  Sparkles,
  Wifi,
  ChevronRight,
  School,
  Lock,
} from 'lucide-react';

export function AuthModal() {
  const setUser = useAppStore((s) => s.setUser);
  const setSchedule = useAppStore((s) => s.setSchedule);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const addScanEvent = useAppStore((s) => s.addScanEvent);
  const addToast = useAppStore((s) => s.addToast);
  const setTapFeedback = useAppStore((s) => s.setTapFeedback);
  const enrolledStudents = useAppStore((s) => s.enrolledStudents);

  const [view, setView] = useState('select'); // 'select' | 'login-student' | 'login-teacher' | 'register'
  const [regRole, setRegRole] = useState('student'); // 'student' | 'teacher'

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [tapInput, setTapInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifiedEntity, setVerifiedEntity] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [regPassword, setRegPassword] = useState('');

  const handleTeacherLogin = (facultyMember = null) => {
    const faculty =
      facultyMember ||
      AUTHORIZED_FACULTY.find(
        (f) =>
          f.faculty_id.toLowerCase() === loginId.trim().toLowerCase() ||
          f.card_uid.toLowerCase() === loginId.trim().toLowerCase() ||
          f.email.toLowerCase() === loginId.trim().toLowerCase() ||
          f.name.toLowerCase().includes(loginId.trim().toLowerCase())
      ) ||
      MADALIPAY_TEACHER;

    const teacherUser = {
      id: faculty.faculty_id,
      faculty_id: faculty.faculty_id,
      name: faculty.name,
      role: 'teacher',
      email: faculty.email,
      department: faculty.department,
      card_uid: faculty.card_uid,
    };

    setUser(teacherUser);
    localStorage.setItem('tapslog_user', JSON.stringify(teacherUser));

    // STRICT: Only subjects belonging to this teacher
    const teacherSchedule = getScheduleForTeacher(faculty.faculty_id || faculty.name);
    setSchedule(teacherSchedule);
    setActiveSession(teacherSchedule.current_class);

    const feed = generateInitialFeed();
    feed.forEach((event) => addScanEvent(event));

    playBeep('success');
    addToast({ message: `Logged in as ${faculty.name}`, type: 'success' });
  };

  const handleStudentLogin = (studentMember = null) => {
    const student =
      studentMember ||
      enrolledStudents.find(
        (s) =>
          s.student_id.toLowerCase() === loginId.trim().toLowerCase() ||
          s.card_uid.toLowerCase() === loginId.trim().toLowerCase() ||
          s.name.toLowerCase() === loginId.trim().toLowerCase()
      ) ||
      enrolledStudents[0];

    const studentUser = {
      id: student.student_id,
      student_id: student.student_id,
      name: student.name,
      role: 'student',
      email: student.email,
      program: student.program,
      card_uid: student.card_uid,
      attendance_rate: student.attendance_rate,
      year: student.year,
    };

    setUser(studentUser);
    localStorage.setItem('tapslog_user', JSON.stringify(studentUser));
    setSchedule(MOCK_SCHEDULE_RESPONSE);
    setActiveSession(MOCK_SCHEDULE_RESPONSE.current_class);

    playBeep('success');
    addToast({ message: `Welcome, ${student.name}`, type: 'success' });
  };

  const handleVerifyIdTap = () => {
    if (!tapInput.trim()) {
      setVerifyError('Please enter or tap an ID.');
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifiedEntity(null);

    setTimeout(() => {
      setVerifying(false);
      const query = tapInput.trim().toUpperCase();

      if (regRole === 'student') {
        const found = enrolledStudents.find(
          (s) =>
            s.student_id.toUpperCase() === query ||
            s.card_uid.toUpperCase() === query ||
            s.name.toUpperCase().includes(query)
        );

        if (found) {
          setVerifiedEntity(found);
          setVerifyError(null);
          playBeep('success');
          setTapFeedback('success');
        } else {
          setVerifyError('Student ID not found in enrollment records.');
          playBeep('error');
          setTapFeedback('error');
        }
      } else {
        const isStudentCard = enrolledStudents.find(
          (s) =>
            s.student_id.toUpperCase() === query ||
            s.card_uid.toUpperCase() === query
        );

        if (isStudentCard) {
          setVerifyError('Access Denied. Student cards cannot register as Faculty.');
          playBeep('error');
          setTapFeedback('error');
          return;
        }

        const facultyFound = AUTHORIZED_FACULTY.find(
          (f) =>
            f.faculty_id.toUpperCase() === query ||
            f.card_uid.toUpperCase() === query ||
            f.name.toUpperCase().includes(query)
        );

        if (facultyFound) {
          setVerifiedEntity(facultyFound);
          setVerifyError(null);
          playBeep('success');
          setTapFeedback('success');
        } else {
          setVerifyError('Faculty ID not recognized.');
          playBeep('error');
          setTapFeedback('error');
        }
      }
    }, 500);
  };

  const handleCompleteRegistration = (e) => {
    e.preventDefault();
    if (!verifiedEntity) return;

    if (regRole === 'student') {
      handleStudentLogin(verifiedEntity);
    } else {
      handleTeacherLogin(verifiedEntity);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6 sm:p-7 text-slate-800">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img src="/tapslog-logo.png" alt="TapsLog" className="h-8 max-h-8 object-contain" />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              NFC
            </span>
          </div>

          {view !== 'select' && (
            <button
              onClick={() => {
                setView('select');
                setVerifiedEntity(null);
                setVerifyError(null);
                setTapInput('');
              }}
              className="btn-ghost text-xs px-2.5 py-1 text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          )}
        </div>

        {/* ─── VIEW 1: SELECTION ─────────────────────────────────────────────── */}
        {view === 'select' && (
          <div className="py-5 space-y-4 animate-fade-in">
            <div className="text-center space-y-0.5">
              <h2 className="text-lg font-bold text-slate-900">Select Portal</h2>
              <p className="text-xs text-slate-500">Choose your role to continue</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setView('login-student');
                  setLoginId('');
                }}
                className="card p-4 text-left border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all rounded-xl flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Student</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Tap-in & schedule</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-brand-600 font-medium">
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => {
                  setView('login-teacher');
                  setLoginId('');
                }}
                className="card p-4 text-left border border-slate-200 hover:border-brand-500 hover:shadow-md transition-all rounded-xl flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Teacher</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Live sessions & roster</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[11px] text-indigo-600 font-medium">
                  <span>Enter</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Quick Demo Access */}
            <div className="pt-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-500" /> Fast Demo Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStudentLogin(ENROLLED_STUDENTS[0])}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[11px] font-semibold text-slate-700 hover:text-brand-600 border border-slate-200 text-left truncate transition-colors"
                >
                  Juan (Student)
                </button>
                {AUTHORIZED_FACULTY.map((faculty) => (
                  <button
                    key={faculty.faculty_id}
                    onClick={() => handleTeacherLogin(faculty)}
                    title={`Demo login as ${faculty.name}`}
                    className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[11px] font-semibold text-slate-700 hover:text-brand-600 border border-slate-200 text-left truncate transition-colors"
                  >
                    {faculty.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                New user?{' '}
                <button
                  onClick={() => {
                    setView('register');
                    setRegRole('student');
                    setVerifiedEntity(null);
                    setVerifyError(null);
                    setTapInput('');
                  }}
                  className="text-brand-600 hover:text-brand-700 underline font-semibold transition-colors"
                >
                  register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ─── VIEW 2: STUDENT LOGIN ─────────────────────────────────────────── */}
        {view === 'login-student' && (
          <div className="py-4 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Login</h3>
              <p className="text-xs text-slate-500">Enter ID or tap card</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Student ID / UID</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 2023-10492"
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">PIN / Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>

              <button onClick={() => handleStudentLogin()} className="btn-primary w-full py-2.5">
                Sign In
              </button>

              <button
                onClick={() => handleStudentLogin(ENROLLED_STUDENTS[0])}
                className="w-full text-xs text-brand-600 hover:text-brand-700 py-1 font-medium text-center"
              >
                Fast login as Juan dela Cruz
              </button>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Need to enroll?{' '}
                <button
                  onClick={() => {
                    setView('register');
                    setRegRole('student');
                  }}
                  className="text-brand-600 hover:text-brand-700 underline font-medium"
                >
                  register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: TEACHER LOGIN ─────────────────────────────────────────── */}
        {view === 'login-teacher' && (
          <div className="py-4 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900">Teacher Login</h3>
              <p className="text-xs text-slate-500">Faculty credentials required</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Faculty ID / Badge</label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. FAC-2024-001"
                  className="input-field font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>

              <button onClick={() => handleTeacherLogin()} className="btn-primary w-full py-2.5">
                Launch Console
              </button>

              <button
                onClick={() => handleTeacherLogin(MADALIPAY_TEACHER)}
                className="w-full text-xs text-brand-600 hover:text-brand-700 py-1 font-semibold text-center"
              >
                Fast login as Mark Anthony Madalipay
              </button>
            </div>

            <div className="text-center pt-1">
              <p className="text-xs text-slate-500">
                Faculty registration?{' '}
                <button
                  onClick={() => {
                    setView('register');
                    setRegRole('teacher');
                  }}
                  className="text-brand-600 hover:text-brand-700 underline font-medium"
                >
                  register
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ─── VIEW 4: REGISTRATION ──────────────────────────────────────────── */}
        {view === 'register' && (
          <div className="py-4 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-base font-bold text-slate-900">ID Registration</h3>
              <p className="text-xs text-slate-500">Tap your card to verify enrollment</p>
            </div>

            {/* Role switch */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setRegRole('student');
                  setVerifiedEntity(null);
                  setVerifyError(null);
                  setTapInput('');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  regRole === 'student' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegRole('teacher');
                  setVerifiedEntity(null);
                  setVerifyError(null);
                  setTapInput('');
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  regRole === 'teacher' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                Teacher
              </button>
            </div>

            {/* Tap input */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tapInput}
                  onChange={(e) => setTapInput(e.target.value)}
                  placeholder={regRole === 'student' ? 'Enter Student ID (2023-10492)' : 'Enter Faculty ID (FAC-ALFON)'}
                  className="input-field font-mono text-xs"
                />
                <button
                  type="button"
                  onClick={handleVerifyIdTap}
                  disabled={verifying}
                  className="btn-primary text-xs px-3.5 shrink-0"
                >
                  {verifying ? 'Checking...' : 'Verify'}
                </button>
              </div>

              <div className="flex gap-1.5">
                <span className="text-[10px] text-slate-400">Sample:</span>
                <button
                  type="button"
                  onClick={() => setTapInput(regRole === 'student' ? '2023-10492' : 'FAC-ALFON')}
                  className="text-[10px] text-brand-600 hover:underline font-mono"
                >
                  {regRole === 'student' ? '2023-10492' : 'FAC-ALFON'}
                </button>
              </div>
            </div>

            {verifyError && (
              <div className="p-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {verifiedEntity && (
              <form onSubmit={handleCompleteRegistration} className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified: {verifiedEntity.name}</span>
                </div>

                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set Password"
                  className="input-field text-xs"
                />

                <button type="submit" className="btn-primary w-full bg-emerald-600 hover:bg-emerald-700">
                  Complete & Enter
                </button>
              </form>
            )}

            <div className="text-center pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setView('select')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
