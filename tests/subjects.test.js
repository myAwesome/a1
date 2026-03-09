'use strict';

const request = require('supertest');
const app = require('../src/app');
const { clearTables } = require('./helpers');

beforeEach(clearTables);

describe('Subjects API', () => {
  describe('GET /api/subjects', () => {
    it('returns empty array when no subjects', async () => {
      const res = await request(app).get('/api/subjects');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns all subjects', async () => {
      await request(app).post('/api/subjects').send({ name: 'Math' });
      await request(app).post('/api/subjects').send({ name: 'Physics' });

      const res = await request(app).get('/api/subjects');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toMatchObject({ name: 'Math' });
      expect(res.body[1]).toMatchObject({ name: 'Physics' });
    });
  });

  describe('GET /api/subjects/:id', () => {
    it('returns a subject by id', async () => {
      const created = await request(app).post('/api/subjects').send({ name: 'Math' });
      const res = await request(app).get(`/api/subjects/${created.body.id}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.body.id, name: 'Math' });
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/api/subjects/9999');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/subjects', () => {
    it('creates a subject and returns 201', async () => {
      const res = await request(app).post('/api/subjects').send({ name: 'Math' });
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ name: 'Math' });
      expect(res.body.id).toBeDefined();
    });

    it('returns 400 when name is missing', async () => {
      const res = await request(app).post('/api/subjects').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/subjects/:id', () => {
    it('updates a subject', async () => {
      const created = await request(app).post('/api/subjects').send({ name: 'Math' });
      const res = await request(app)
        .put(`/api/subjects/${created.body.id}`)
        .send({ name: 'Advanced Math' });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: 'Advanced Math' });
    });

    it('returns 400 when name is missing', async () => {
      const created = await request(app).post('/api/subjects').send({ name: 'Math' });
      const res = await request(app).put(`/api/subjects/${created.body.id}`).send({});
      expect(res.status).toBe(400);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).put('/api/subjects/9999').send({ name: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/subjects/:id', () => {
    it('deletes a subject and returns 204', async () => {
      const created = await request(app).post('/api/subjects').send({ name: 'Math' });
      const res = await request(app).delete(`/api/subjects/${created.body.id}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for unknown id', async () => {
      const res = await request(app).delete('/api/subjects/9999');
      expect(res.status).toBe(404);
    });
  });
});
