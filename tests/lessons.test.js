'use strict';

const request = require('supertest');
const app = require('../src/app');
const { clearTables } = require('./helpers');

beforeEach(clearTables);

async function createSubject(name = 'Math') {
  const res = await request(app).post('/api/subjects').send({ name });
  return res.body;
}

describe('Lessons API', () => {
  describe('GET /api/lessons', () => {
    it('returns empty array when no lessons', async () => {
      const res = await request(app).get('/api/lessons');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all lessons', async () => {
      const subject = await createSubject();
      await request(app).post('/api/lessons').send({ subject_id: subject.id, date: '2026-03-10' });
      await request(app).post('/api/lessons').send({ subject_id: subject.id, date: '2026-03-11' });

      const res = await request(app).get('/api/lessons');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('GET /api/lessons/:id', () => {
    it('returns a lesson by id', async () => {
      const subject = await createSubject();
      const created = await request(app)
        .post('/api/lessons')
        .send({ subject_id: subject.id, date: '2026-03-10' });

      const res = await request(app).get(`/api/lessons/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ subject_id: subject.id, date: '2026-03-10' });
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/lessons/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/lessons', () => {
    it('creates a lesson and returns 201', async () => {
      const subject = await createSubject();
      const res = await request(app)
        .post('/api/lessons')
        .send({ subject_id: subject.id, date: '2026-03-10' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ subject_id: subject.id, date: '2026-03-10' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when subject_id is missing', async () => {
      const res = await request(app).post('/api/lessons').send({ date: '2026-03-10' });
      expect(res.status).toBe(400);
    });

    it('returns 400 when date is missing', async () => {
      const subject = await createSubject();
      const res = await request(app).post('/api/lessons').send({ subject_id: subject.id });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/lessons/:id', () => {
    it('updates a lesson', async () => {
      const subject = await createSubject();
      const created = await request(app)
        .post('/api/lessons')
        .send({ subject_id: subject.id, date: '2026-03-10' });

      const res = await request(app)
        .put(`/api/lessons/${created.body.id}`)
        .send({ subject_id: subject.id, date: '2026-03-15' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ date: '2026-03-15' });
    });

    it('returns 400 when fields are missing', async () => {
      const subject = await createSubject();
      const created = await request(app)
        .post('/api/lessons')
        .send({ subject_id: subject.id, date: '2026-03-10' });

      const res = await request(app).put(`/api/lessons/${created.body.id}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown id', async () => {
      const subject = await createSubject();
      const res = await request(app)
        .put('/api/lessons/9999')
        .send({ subject_id: subject.id, date: '2026-03-10' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/lessons/:id', () => {
    it('deletes a lesson and returns 204', async () => {
      const subject = await createSubject();
      const created = await request(app)
        .post('/api/lessons')
        .send({ subject_id: subject.id, date: '2026-03-10' });

      const res = await request(app).delete(`/api/lessons/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).delete('/api/lessons/9999');
      expect(res.status).toBe(404);
    });
  });
});
