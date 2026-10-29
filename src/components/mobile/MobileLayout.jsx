/**
 * MobileLayout.jsx — Synchronized Native Mobile Layout
 * Matches Desktop structure 1:1 with mobile-responsive controls.
 */
import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';
import {
  ScanLine,
  LayoutDashboard,
  Calendar,
  Activity,
  Users,
  Settings,
  Clock,
  IdCard,
} from 'lucide-react';
import { NotificationBell } from '../shared/NotificationBell';

// Teacher Views
import { MobileDashboard } from '../../pages/mobile/MobileDashboard';
import { LiveStreamView } from '../../pages/teacher/LiveStreamView';
import { ScheduleView } from '../../pages/teacher/ScheduleView';
import { StudentsView } from '../../pages/teacher/StudentsView';
import { SettingsView } from '../../pages/teacher/SettingsView';

// Student Views
import { StudentLiveTime } from '../../pages/student/StudentLiveTime';
import { StudentSchedule } from '../../pages/student/StudentSchedule';
import { StudentAccount } from '../../pages/student/StudentAccount';
import { StudentSettings } from '../../pages/student/StudentSettings';

// Teacher Nav (synced 1:1 with PC version)
const TEACHER_NAV = [
  { id: 'dashboard',  label: 'Dashboard',   Icon: LayoutDashboard },
  { id: 'livestream', label: 'Live Stream', Icon: Activity        },
  { id: 'schedule',   label: 'Schedule',    Icon: Calendar        },
  { id: 'students',   label: 'Students',    Icon: Users           },
  { id: 'settings',   label: 'Settings',    Icon: Settings        },
];

const TEACHER_COMPONENTS = {
  dashboard:  MobileDashboard,
  livestream: LiveStreamView,
  schedule:   ScheduleView,
  students:   StudentsView,
  settings:   SettingsView,
};

// Student Nav (synced 1:1 with PC version)
const STUDENT_NAV = [
  { id: 'livetime', label: 'Live Time', Icon: Clock    },
  { id: 'schedule', label: 'Schedule',  Icon: Calendar },
  { id: 'account',  label: 'Account',   Icon: IdCard   },
  { id: 'settings', label: 'Settings',  Icon: Settings },
];

const STUDENT_COMPONENTS = {
  livetime: StudentLiveTime,
  schedule: StudentSchedule,
  account:  StudentAccount,
  settings: StudentSettings,
};

export function MobileLayout() {
  const user = useAppStore((s) => s.user);
  const sessionStatus = useAppStore((s) => s.sessionStatus);
  const activeSession = useAppStore((s) => s.activeSession);

  const isTeacher = user?.role === 'teacher';
  const navItems = isTeacher ? TEACHER_NAV : STUDENT_NAV;
  const componentsMap = isTeacher ? TEACHER_COMPONENTS : STUDENT_COMPONENTS;

  // Use store state or local state synced
  const [activeTab, setActiveTab] = useState(isTeacher ? 'dashboard' : 'livetime');
  const ActiveComponent = componentsMap[activeTab] || (isTeacher ? MobileDashboard : StudentLiveTime);

  return (
    <div className="flex h-dvh flex-col overflow-hidden app-surface text-slate-800 pt-safe">
      {/* ── Top Header Bar ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/tapslog-logo.png" alt="TapsLog" className="h-6 max-h-6 object-contain" />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-brand-700 border border-blue-100">
              {isTeacher ? 'Faculty' : 'Student'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell />
            {sessionStatus === 'ACTIVE' && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping-slow" />
                Live
              </span>
            )}
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-brand-700">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Dynamic Content Page ─────────────────────────────────────── */}
      <main className="min-h-0 flex-1 overflow-hidden pb-20">
        <ActiveComponent />
      </main>

      {/* ── Synced Sticky Bottom Nav Bar ─────────────────────────────── */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 pb-safe shadow-lg">
        <div className="flex items-center justify-around px-1 py-1.5">
          {navItems.map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 py-1 relative transition-colors',
                  isActive ? 'text-brand-600 font-semibold' : 'text-slate-400 hover:text-slate-700'
                )}
              >
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-brand-600" />
                )}
                <Icon className={cn('w-4 h-4', isActive ? 'text-brand-600' : 'text-slate-400')} />
                <span className="text-[10px] mt-0.5 leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
