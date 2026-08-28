const { expect } = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const app = require('../src/app');
const env = require('../src/config/env');
const userRepository = require('../src/repositories/userRepository');
const { buildUser, signToken, authHeader } = require('./helpers');

describe('Authentication API', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user successfully', async () => {
      const created = buildUser({ id: 5, name: 'Ada', email: 'ada@example.com' });
      sinon.stub(userRepository, 'findByEmail').resolves(null);
      sinon.stub(userRepository, 'createUser').resolves(created);

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Ada', email: 'ada@example.com', password: 'password123' });

      expect(res.status).to.equal(201);
      expect(res.body.message).to.equal('Registration successful.');
      expect(res.body.data.user).to.include({
        id: 5,
        name: 'Ada',
        email: 'ada@example.com',
      });
      expect(res.body.data.user).to.not.have.property('password_hash');
      expect(res.body.data.token).to.be.a('string');
    });

    it('rejects a duplicate email', async () => {
      sinon.stub(userRepository, 'findByEmail').resolves(buildUser());

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Ada', email: 'test@example.com', password: 'password123' });

      expect(res.status).to.equal(409);
      expect(res.body.code).to.equal('EMAIL_EXISTS');
    });

    it('rejects invalid registration data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'A', email: 'bad', password: 'short' });

      expect(res.status).to.equal(400);
      expect(res.body.code).to.equal('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('logs in with valid credentials', async () => {
      sinon.stub(userRepository, 'findByEmail').resolves(buildUser());

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).to.equal(200);
      expect(res.body.data.user.email).to.equal('test@example.com');
      expect(res.body.data.user).to.not.have.property('password_hash');
      expect(res.body.data.token).to.be.a('string');
    });

    it('rejects invalid credentials', async () => {
      sinon.stub(userRepository, 'findByEmail').resolves(buildUser());

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrong-password' });

      expect(res.status).to.equal(401);
      expect(res.body.code).to.equal('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    it('rejects requests without authentication', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).to.equal(401);
      expect(res.body.code).to.equal('UNAUTHORIZED');
    });

    it('rejects an invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set(authHeader('not-a-valid-token'));

      expect(res.status).to.equal(401);
      expect(res.body.code).to.equal('INVALID_TOKEN');
    });

    it('rejects an expired token', async () => {
      const token = jwt.sign(
        { sub: 1, email: 'test@example.com' },
        env.jwt.secret,
        { expiresIn: -1 }
      );

      const res = await request(app).get('/api/auth/me').set(authHeader(token));

      expect(res.status).to.equal(401);
      expect(res.body.code).to.equal('TOKEN_EXPIRED');
    });

    it('returns the current user for a valid token', async () => {
      sinon.stub(userRepository, 'findById').resolves(buildUser());
      const token = signToken();

      const res = await request(app).get('/api/auth/me').set(authHeader(token));

      expect(res.status).to.equal(200);
      expect(res.body.data.user).to.include({
        id: 1,
        email: 'test@example.com',
      });
    });
  });
});
