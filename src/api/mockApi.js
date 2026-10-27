/**
 * mockApi.js — Intercepts Axios calls when backend is offline
 * Returns realistic mock responses that mirror the real API shapes.
 * Automatically activates when VITE_USE_MOCK=true OR backend is unreachable.
 */
import api from './axiosInstance';
import {
  MOCK_SCHEDULE_RESPONSE,
  getScheduleForTeacher,
  makeMockScanEvent,
} from '../lib/mockData';

let _mockActive = false;

/** Check if the backend is reachable */
export async function probeBackend() {
  try {
    await api.get('/api/health', { timeout: 2000 });
    return true;
  } catch {
    // Try the root too — some backends don't have /api/health
    try {
      await api.get('/', { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

/** Returns true if mock mode is currently active */
export function isMockActive() {
  return _mockActive;
}

/**
 * Install Axios interceptors to mock API responses.
 * Call once on app startup when backend is offline.
 */
export function installMockInterceptors() {
  if (_mockActive) return;
  _mockActive = true;

  let scanCounter = 0;

  api.interceptors.request.use(async (config) => {
    const url = config.url || '';

    // ── POST /api/attendance/scan ────────────────────────────────────────
    if (config.method === 'post' && url.includes('/api/attendance/scan')) {
      const body = JSON.parse(config.data || '{}');
      const statuses = ['PRESENT', 'PRESENT', 'LATE', 'COMPLETED'];
      const status   = statuses[scanCounter % statuses.length];
      const actions  = {
        PRESENT:   'STUDENT_TIME_IN',
        LATE:      'STUDENT_TIME_IN',
        COMPLETED: 'STUDENT_TIME_OUT',
      };
      scanCounter++;

      return Promise.reject({
        __mock: true,
        data: {
          success:    true,
          action:     actions[status] || 'STUDENT_TIME_IN',
          status,
          student:    'Demo Student ' + scanCounter,
          program:    'BSIT-3A',
          scanned_at: new Date().toISOString(),
        },
      });
    }

    // ── GET /api/teacher/schedule/:id ────────────────────────────────────
    if (config.method === 'get' && url.includes('/api/teacher/schedule/')) {
      const parts = url.split('/api/teacher/schedule/');
      const teacherParam = parts[1] ? decodeURIComponent(parts[1].split('?')[0]) : null;
      const teacherSchedule = getScheduleForTeacher(teacherParam);
      return Promise.reject({
        __mock: true,
        data: teacherSchedule,
      });
    }

    // ── POST /api/teacher/session/:id/activate ───────────────────────────
    if (config.method === 'post' && url.includes('/activate')) {
      return Promise.reject({
        __mock: true,
        data: { success: true, message: 'Session activated (mock)' },
      });
    }

    // ── POST /api/teacher/session/:id/close ─────────────────────────────
    if (config.method === 'post' && url.includes('/close')) {
      return Promise.reject({
        __mock: true,
        data: { success: true, message: 'Session closed (mock)' },
      });
    }

    // ── POST /api/teacher/session/:id/auto-absent ────────────────────────
    if (config.method === 'post' && url.includes('/auto-absent')) {
      return Promise.reject({
        __mock: true,
        data: { success: true, message: 'Auto-absent triggered (mock)' },
      });
    }

    return config;
  });

  // Intercept the mock-rejected requests and resolve them as successes
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.__mock) {
        return Promise.resolve({ data: error.data, status: 200 });
      }
      return Promise.reject(error);
    }
  );

  console.info('[TapsLog] 🔌 Mock API active — backend offline');
}
