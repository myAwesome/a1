'use strict';

const request = require('supertest');
const app = require('../src/app');
const { clearTables } = require('./helpers');

beforeEach(clearTables);

describe('Students API', () => {
  describe('GET /api/students', () => {
    it('returns empty array when no students', async () => {
      const res = await request(app).get('/api/students');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all students', async () => {
      await request(app).post('/api/students').send({ name: 'Alice' });
      await request(app).post('/api/students').send({ name: 'Bob' });

      const res = await request(app).get('/api/students');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ name: 'Alice' });
      expect(res.body[1]).toMatchObject({ name: 'Bob' });
    });
  });

  describe('GET /api/students/:id', () => {
    it('returns a student by id', async () => {
      const created = await request(app).post('/api/students').send({ name: 'Alice' });
      const res = await request(app).get(`/api/students/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.body.id, name: 'Alice' });
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/students/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/students', () => {
    it('creates a student and returns 201', async () => {
      const res = await request(app).post('/api/students').send({ name: 'Alice' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Alice' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/students').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/students/:id', () => {
    it('updates a student', async () => {
      const created = await request(app).post('/api/students').send({ name: 'Alice' });
      const res = await request(app)
        .put(`/api/students/${created.body.id}`)
        .send({ name: 'Alice Updated' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Alice Updated' });
    });

    it('returns 400 when name is missing', async () => {
      const created = await request(app).post('/api/students').send({ name: 'Alice' });
      const res = await request(app).put(`/api/students/${created.body.id}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).put('/api/students/9999').send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('deletes a student and returns 204', async () => {
      const created = await request(app).post('/api/students').send({ name: 'Alice' });
      const res = await request(app).delete(`/api/students/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).delete('/api/students/9999');
      expect(res.status).toBe(404);
    });
  });
});
