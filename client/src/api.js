const BASE = '/api';

async function request(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(BASE + path, opts);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Students
export const getStudents = () => request('GET', '/students');
export const createStudent = (name) => request('POST', '/students', { name });
export const deleteStudent = (id) => request('DELETE', `/students/${id}`);

// Subjects
export const getSubjects = () => request('GET', '/subjects');
export const createSubject = (name) => request('POST', '/subjects', { name });
export const deleteSubject = (id) => request('DELETE', `/subjects/${id}`);

// Lessons
export const getLessons = () => request('GET', '/lessons');
export const createLesson = (subject_id, date) => request('POST', '/lessons', { subject_id, date });
export const deleteLesson = (id) => request('DELETE', `/lessons/${id}`);

// Attendance
export const getAttendanceForLesson = (lessonId) => request('GET', `/attendance/lesson/${lessonId}`);
export const getAttendanceForStudent = (studentId) => request('GET', `/attendance/student/${studentId}`);
export const markAttendance = (student_id, lesson_id, present) =>
  request('PUT', '/attendance', { student_id, lesson_id, present });
