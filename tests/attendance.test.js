'use strict';

const request = require('supertest');
const app = require('../src/app');
const { clearTables } = require('./helpers');

beforeEach(clearTables);

async function setup() {
  const subject = (await request(app).post('/api/subjects').send({ name: 'Math' })).body;
  const lesson  = (await request(app).post('/api/lessons').send({ subject_id: subject.id, date: '2026-03-10' })).body;
  const student = (await request(app).post('/api/students').send({ name: 'Alice' })).body;
  return { subject, lesson, student };
}

describe('Attendance API', () => {
  describe('PUT /api/attendance', () => {
    it('marks a student as present and returns the record', async () => {
      const { lesson, student } = await setup();
      const res = await request(app).put('/api/attendance').send({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    true,
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    true,
      });
    });

    it('marks a student as absent', async () => {
      const { lesson, student } = await setup();
      const res = await request(app).put('/api/attendance').send({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    false,
      });
      expect(res.status).toBe(200);
      expect(res.body.present).toBe(false);
    });

    it('updates existing attendance record (upsert)', async () => {
      const { lesson, student } = await setup();
      await request(app).put('/api/attendance').send({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    true,
      });
      const res = await request(app).put('/api/attendance').send({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    false,
      });
      expect(res.status).toBe(200);
      expect(res.body.present).toBe(false);
    });

    it('returns 400 when student_id is missing', async () => {
      const { lesson } = await setup();
      const res = await request(app).put('/api/attendance').send({
        lesson_id: lesson.id,
        present:   true,
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 when lesson_id is missing', async () => {
      const { student } = await setup();
      const res = await request(app).put('/api/attendance').send({
        student_id: student.id,
        present:    true,
      });
      expect(res.status).toBe(400);
    });

    it('returns 400 when present is not a boolean', async () => {
      const { lesson, student } = await setup();
      const res = await request(app).put('/api/attendance').send({
        student_id: student.id,
        lesson_id:  lesson.id,
        present:    'yes',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/attendance/lesson/:lessonId', () => {
    it('returns empty array when no attendance recorded', async () => {
      const { lesson } = await setup();
      const res = await request(app).get(`/api/attendance/lesson/${lesson.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns attendance records with student names', async () => {
      const { lesson, student } = await setup();
      const student2 = (await request(app).post('/api/students').send({ name: 'Bob' })).body;

      await request(app).put('/api/attendance').send({ student_id: student.id,  lesson_id: lesson.id, present: true });
      await request(app).put('/api/attendance').send({ student_id: student2.id, lesson_id: lesson.id, present: false });

      const res = await request(app).get(`/api/attendance/lesson/${lesson.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ student_name: 'Alice', present: true });
      expect(res.body[1]).toMatchObject({ student_name: 'Bob',   present: false });
    });
  });

  describe('GET /api/attendance/student/:studentId', () => {
    it('returns empty array when no attendance recorded', async () => {
      const { student } = await setup();
      const res = await request(app).get(`/api/attendance/student/${student.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns attendance records with lesson date and subject name', async () => {
      const { lesson, student, subject } = await setup();
      const lesson2 = (await request(app).post('/api/lessons').send({ subject_id: subject.id, date: '2026-03-11' })).body;

      await request(app).put('/api/attendance').send({ student_id: student.id, lesson_id: lesson.id,  present: true });
      await request(app).put('/api/attendance').send({ student_id: student.id, lesson_id: lesson2.id, present: false });

      const res = await request(app).get(`/api/attendance/student/${student.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ lesson_date: '2026-03-10', subject_name: 'Math', present: true });
      expect(res.body[1]).toMatchObject({ lesson_date: '2026-03-11', subject_name: 'Math', present: false });
    });
  });
});
