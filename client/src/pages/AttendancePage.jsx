import { useState, useEffect } from 'react';
import { getLessons, getStudents, getAttendanceForLesson, markAttendance } from '../api.js';

export default function AttendancePage({ subjects }) {
  const [lessons, setLessons] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getLessons(), getStudents()])
      .then(([ls, ss]) => {
        setLessons(ls);
        setAllStudents(ss);
        if (ls.length > 0) setSelectedLessonId(String(ls[ls.length - 1].id));
      })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedLessonId) { setRows([]); return; }
    setLoadingRows(true);
    setError(null);
    getAttendanceForLesson(selectedLessonId)
      .then(existing => {
        const merged = allStudents.map(s => {
          const found = existing.find(r => r.student_id === s.id);
          return found ?? { student_id: s.id, lesson_id: Number(selectedLessonId), present: false, student_name: s.name };
        });
        setRows(merged);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoadingRows(false));
  }, [selectedLessonId, allStudents]);

  async function handleToggle(row) {
    const newPresent = !row.present;
    setError(null);
    try {
      await markAttendance(row.student_id, row.lesson_id, newPresent);
      setRows(prev => prev.map(r =>
        r.student_id === row.student_id ? { ...r, present: newPresent } : r
      ));
    } catch (e) {
      setError(e.message);
    }
  }

  function lessonLabel(l) {
    const subj = subjects.find(s => s.id === l.subject_id)?.name ?? '—';
    return `${l.date} — ${subj}`;
  }

  const presentCount = rows.filter(r => r.present).length;

  return (
    <div>
      <h2>Відвідування</h2>
      {lessons.length === 0
        ? <p className="empty-msg">Спочатку створіть уроки</p>
        : (
          <>
            <select
              className="standalone"
              value={selectedLessonId}
              onChange={e => setSelectedLessonId(e.target.value)}
            >
              {lessons.map(l => (
                <option key={l.id} value={l.id}>{lessonLabel(l)}</option>
              ))}
            </select>

            {error && <p className="error-msg">{error}</p>}

            {loadingRows
              ? <p className="empty-msg">Завантаження...</p>
              : rows.length === 0
                ? <p className="empty-msg">Студентів ще немає</p>
                : (
                  <>
                    <p style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>
                      Присутні: <strong>{presentCount}</strong> з <strong>{rows.length}</strong>
                    </p>
                    <table>
                      <thead>
                        <tr><th>Студент</th><th style={{ width: 100 }}>Присутній</th></tr>
                      </thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.student_id}>
                            <td>{r.student_name}</td>
                            <td>
                              <input
                                type="checkbox"
                                checked={r.present}
                                onChange={() => handleToggle(r)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )
            }
          </>
        )
      }
    </div>
  );
}
