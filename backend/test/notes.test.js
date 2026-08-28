const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');

const app = require('../src/app');
const noteRepository = require('../src/repositories/noteRepository');
const { buildNote, signToken, authHeader } = require('./helpers');

describe('Notes API', () => {
  const token = signToken({ id: 1, email: 'test@example.com' });
  const otherToken = signToken({ id: 2, email: 'other@example.com' });

  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/notes', () => {
    it('creates a note for the authenticated user', async () => {
      const created = buildNote({ id: 42, title: 'Ideas', content: '<p>Ship it</p>' });
      sinon.stub(noteRepository, 'createNote').resolves(created);

      const res = await request(app)
        .post('/api/notes')
        .set(authHeader(token))
        .send({ title: 'Ideas', content: '<p>Ship it</p>' });

      expect(res.status).to.equal(201);
      expect(res.body.data.note).to.include({
        id: 42,
        title: 'Ideas',
        content: '<p>Ship it</p>',
      });
      expect(res.body.data.note).to.not.have.property('user_id');
    });

    it('rejects validation failures', async () => {
      const res = await request(app)
        .post('/api/notes')
        .set(authHeader(token))
        .send({ title: '', content: '<p></p>' });

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('GET /api/notes', () => {
    it("retrieves the user's notes", async () => {
      sinon.stub(noteRepository, 'findAllByUserId').resolves([
        buildNote({ id: 1, title: 'One' }),
        buildNote({ id: 2, title: 'Two' }),
      ]);

      const res = await request(app).get('/api/notes').set(authHeader(token));

      expect(res.status).to.equal(200);
      expect(res.body.data.notes).to.have.length(2);
      expect(res.body.data.notes[0].title).to.equal('One');
    });
  });

  describe('GET /api/notes/:id', () => {
    it('retrieves a single owned note', async () => {
      sinon.stub(noteRepository, 'findById').resolves(buildNote({ id: 10 }));

      const res = await request(app).get('/api/notes/10').set(authHeader(token));

      expect(res.status).to.equal(200);
      expect(res.body.data.note.id).to.equal(10);
    });

    it('rejects an invalid note ID', async () => {
      const res = await request(app).get('/api/notes/abc').set(authHeader(token));

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('INVALID_ID');
    });

    it("hides another user's note", async () => {
      sinon.stub(noteRepository, 'findById').resolves(buildNote({ id: 10, user_id: 1 }));

      const res = await request(app).get('/api/notes/10').set(authHeader(otherToken));

      expect(res.status).to.equal(404);
      expect(res.body.code).to.equal('NOTE_NOT_FOUND');
    });
  });

  describe('PATCH /api/notes/:id', () => {
    it('updates an owned note', async () => {
      sinon.stub(noteRepository, 'findById').resolves(buildNote({ id: 10 }));
      sinon
        .stub(noteRepository, 'updateNote')
        .resolves(buildNote({ id: 10, title: 'Updated', content: '<p>New</p>' }));

      const res = await request(app)
        .patch('/api/notes/10')
        .set(authHeader(token))
        .send({ title: 'Updated', content: '<p>New</p>' });

      expect(res.status).to.equal(200);
      expect(res.body.data.note.title).to.equal('Updated');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    it('deletes an owned note', async () => {
      sinon.stub(noteRepository, 'findById').resolves(buildNote({ id: 10 }));
      sinon.stub(noteRepository, 'deleteNote').resolves(true);

      const res = await request(app).delete('/api/notes/10').set(authHeader(token));

      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('Note deleted.');
    });

    it("does not delete another user's note", async () => {
      sinon.stub(noteRepository, 'findById').resolves(buildNote({ id: 10, user_id: 1 }));

      const res = await request(app).delete('/api/notes/10').set(authHeader(otherToken));

      expect(res.status).to.equal(404);
      expect(res.body.code).to.equal('NOTE_NOT_FOUND');
    });
  });
});
