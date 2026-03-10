import { useState, useEffect } from 'react';
import { getStudents, getAttendanceForStudent } from '../api.js';

export default function StudentHistoryPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudents()
      .then(data => {
        setStudents(data);
        if (data.length > 0) setSelectedStudentId(String(data[0].id));
      })
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (!selectedStudentId) { setHistory([]); return; }
    setLoading(true);
    setError(null);
    getAttendanceForStudent(selectedStudentId)
      .then(setHistory)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedStudentId]);

  const presentCount = history.filter(r => r.present).length;

  return (
    <div>
      <h2>Історія студента</h2>
      {students.length === 0
        ? <p className="empty-msg">Студентів ще немає</p>
        : (
          <>
            <select
              className="standalone"
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {error && <p className="error-msg">{error}</p>}

            {loading
              ? <p className="empty-msg">Завантаження...</p>
              : history.length === 0
                ? <p className="empty-msg">Записів про відвідування немає</p>
                : (
                  <>
                    <p style={{ color: '#555', fontSize: 13, marginBottom: 12 }}>
                      Відвідуваність: <strong>{presentCount}</strong> з <strong>{history.length}</strong> уроків
                      {' '}({Math.round(presentCount / history.length * 100)}%)
                    </p>
                    <table>
                      <thead>
                        <tr><th>Дата</th><th>Предмет</th><th>Статус</th></tr>
                      </thead>
                      <tbody>
                        {history.map(r => (
                          <tr key={r.lesson_id}>
                            <td>{r.lesson_date}</td>
                            <td>{r.subject_name}</td>
                            <td>
                              <span className={`badge ${r.present ? 'badge-present' : 'badge-absent'}`}>
                                {r.present ? 'Присутній' : 'Відсутній'}
                              </span>
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
