/**
 * Attendance Service — wraps /api/attendance endpoints
 */
import api from './axiosInstance';

/**
 * Scan an NFC card for a given session.
 * POST /api/attendance/scan
 *
 * @param {{ session_id: string, card_uid: string }} payload
 * @returns {Promise<ScanResponse>}
 *
 * @typedef {Object} ScanResponse
 * @property {boolean} success
 * @property {string} action   - e.g. "STUDENT_TIME_IN" | "STUDENT_TIME_OUT" | "SESSION_ACTIVATED"
 * @property {string} status   - e.g. "PRESENT" | "LATE" | "COMPLETED"
 * @property {string} student  - Student full name
 * @property {string} scanned_at - ISO date string
 */
export async function scanCard({ session_id, card_uid }) {
  const response = await api.post('/api/attendance/scan', { session_id, card_uid });
  return response.data;
}

/**
 * Get attendance records for a session.
 * GET /api/attendance/session/:session_id
 *
 * @param {string} sessionId
 * @returns {Promise<AttendanceRecord[]>}
 */
export async function getSessionAttendance(sessionId) {
  const response = await api.get(`/api/attendance/session/${sessionId}`);
  return response.data;
}
