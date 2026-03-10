import { useState, useEffect } from 'react';
import { getSubjects } from './api.js';
import StudentsPage from './pages/StudentsPage.jsx';
import SubjectsPage from './pages/SubjectsPage.jsx';
import LessonsPage from './pages/LessonsPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import StudentHistoryPage from './pages/StudentHistoryPage.jsx';

const TABS = [
  { key: 'attendance',    label: 'Відвідування' },
  { key: 'history',       label: 'Історія студента' },
  { key: 'lessons',       label: 'Уроки' },
  { key: 'students',      label: 'Студенти' },
  { key: 'subjects',      label: 'Предмети' },
];

export default function App() {
  const [activePage, setActivePage] = useState('attendance');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    getSubjects().then(setSubjects).catch(() => {});
  }, []);

  return (
    <>
      <nav>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={activePage === tab.key ? 'active' : ''}
            onClick={() => setActivePage(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activePage === 'attendance' && <AttendancePage subjects={subjects} />}
      {activePage === 'history'    && <StudentHistoryPage />}
      {activePage === 'lessons'    && <LessonsPage subjects={subjects} />}
      {activePage === 'students'   && <StudentsPage />}
      {activePage === 'subjects'   && (
        <SubjectsPage onSubjectsChange={setSubjects} />
      )}
    </>
  );
}
