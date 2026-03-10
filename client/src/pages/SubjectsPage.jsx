import { useState, useEffect } from 'react';
import { getSubjects, createSubject, deleteSubject } from '../api.js';

export default function SubjectsPage({ onSubjectsChange }) {
  const [subjects, setSubjects] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getSubjects().then(data => {
      setSubjects(data);
      onSubjectsChange(data);
    }).catch(e => setError(e.message));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const subject = await createSubject(name.trim());
      const updated = [...subjects, subject];
      setSubjects(updated);
      onSubjectsChange(updated);
      setName('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setError(null);
    try {
      await deleteSubject(id);
      const updated = subjects.filter(s => s.id !== id);
      setSubjects(updated);
      onSubjectsChange(updated);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Предмети</h2>
      <form className="form-row" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Назва предмета"
        />
        <button className="btn-primary" type="submit" disabled={loading || !name.trim()}>
          Додати
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {subjects.length === 0
        ? <p className="empty-msg">Предметів ще немає</p>
        : (
          <table>
            <thead>
              <tr><th>#</th><th>Назва</th><th></th></tr>
            </thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td style={{ color: '#999', width: 40 }}>{s.id}</td>
                  <td>{s.name}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-danger" onClick={() => handleDelete(s.id)}>
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
