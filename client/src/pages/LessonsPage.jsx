import { useState, useEffect } from 'react';
import { getLessons, createLesson, deleteLesson } from '../api.js';

export default function LessonsPage({ subjects }) {
  const [lessons, setLessons] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLessons().then(setLessons).catch(e => setError(e.message));
  }, []);

  useEffect(() => {
    if (subjects.length > 0 && !subjectId) {
      setSubjectId(String(subjects[0].id));
    }
  }, [subjects]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!subjectId || !date) return;
    setLoading(true);
    setError(null);
    try {
      const lesson = await createLesson(Number(subjectId), date);
      setLessons(prev => [...prev, lesson]);
      setDate('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteLesson(id);
      setLessons(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  function subjectName(id) {
    return subjects.find(s => s.id === id)?.name ?? '—';
  }

  return (
    <div>
      <h2>Уроки</h2>
      <form className="form-row" onSubmit={handleAdd}>
        <select value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          {subjects.length === 0
            ? <option value="">— спочатку додайте предмети —</option>
            : subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
          }
        </select>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={loading || !subjectId || !date || subjects.length === 0}
        >
          Додати
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {lessons.length === 0
        ? <p className="empty-msg">Уроків ще немає</p>
        : (
          <table>
            <thead>
              <tr><th>Дата</th><th>Предмет</th><th></th></tr>
            </thead>
            <tbody>
              {lessons.map(l => (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>{subjectName(l.subject_id)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-danger" onClick={() => handleDelete(l.id)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  );
}
