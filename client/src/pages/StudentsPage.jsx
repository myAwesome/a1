import { useState, useEffect } from 'react';
import { getStudents, createStudent, deleteStudent } from '../api.js';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudents().then(setStudents).catch(e => setError(e.message));
  }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const student = await createStudent(name.trim());
      setStudents(prev => [...prev, student]);
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
      await deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h2>Студенти</h2>
      <form className="form-row" onSubmit={handleAdd}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ім'я студента"
        />
        <button className="btn-primary" type="submit" disabled={loading || !name.trim()}>
          Додати
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      {students.length === 0
        ? <p className="empty-msg">Студентів ще немає</p>
        : (
          <table>
            <thead>
              <tr><th>#</th><th>Ім'я</th><th></th></tr>
            </thead>
            <tbody>
              {students.map(s => (
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
