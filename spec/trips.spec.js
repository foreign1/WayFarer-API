/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
import request from 'supertest';
import server from '../src/index';
import Model from '../src/models/Model';

const TripModel = new Model('trip');

// POST - Trips Route
describe('/api/v1/tips', () => {
  let data;
  beforeEach(async () => {
    try {
      data = await request(server).post('/api/v1/auth/signin').send({ email: 'admin@test.com', password: 'bananas123' });
      return server;
    } catch (ex) {
      return ex;
    }
  });
  afterEach(async () => {
    try {
      server.close();
      await TripModel.truncate();
    } catch (ex) {
      return ex;
    }
  });

  describe('POST /', () => {
    it('should return 401 if users is not logged in', async () => {
      try {
        const res = await request(server).post('/api/v1/trips');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Access denied. No token provided.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).post('/api/v1/trips').send({ token: 'invalid-token' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Invalid token.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 403 if user_id is invalid', async () => {
      try {
        const { token } = data.body.data;
        const res = await request(server).post('/api/v1/trips').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if not Admin', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).post('/api/v1/trips').send({ token, user_id: userId });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User must be an Admin.');
        expect(res.body.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 201 if token, user_id and is_admin is valid', async () => {
      try {
        const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
        const res = await request(server).post('/api/v1/trips').send({
          token,
          user_id: userId,
          is_admin: isAdmin,
          bus_id: 1,
          origin: 'Abuja',
          destination: 'Lagos',
          trip_date: '2019-09-12',
          fare: 20000,
        });
        expect(res.status).toBe(201);
        expect(Object.keys(res.body)).toEqual(['status', 'data']);
        expect(res.body.data.trip_id && res.body.data.bus_id).toMatch(/\d{1,}/);
        expect(Object.keys(res.body.data).length).toBe(7);
      } catch (ex) {
        return ex;
      }
    });
  });
});


// GET - Trips Route
describe('/api/v1/tips', () => {
  let data;
  beforeEach(async () => {
    try {
      data = await request(server).post('/api/v1/auth/signin').send({ email: 'admin@test.com', password: 'bananas123' });
      return server;
    } catch (ex) {
      return ex;
    }
  });
  afterEach(() => server.close());

  describe('GET /', () => {
    it('should return 401 if users is not logged in', async () => {
      try {
        const res = await request(server).get('/api/v1/trips');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Access denied. No token provided.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).get('/api/v1/trips').send({ token: 'invalid-token' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Invalid token.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 403 if user_id is invalid', async () => {
      try {
        const { token } = data.body.data;
        const res = await request(server).get('/api/v1/trips').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 404 if token, user_id is valid but no trip found', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).get('/api/v1/trips').send({
          token,
          user_id: userId,
        });
        expect(res.status).toBe(404);
        expect(Object.keys(res.body)).toEqual(['status', 'error']);
        expect(res.body.error).toBe('No Trip found.');
      } catch (ex) {
        return ex;
      }
    });
    describe('With trip found', () => {
      let destinationQuery;
      let originQuery;
      beforeEach(async () => {
        try {
          const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
          const tripData = await request(server).post('/api/v1/trips').send({
            token,
            user_id: userId,
            is_admin: isAdmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          });
          const { origin, destination } = tripData.body.data;
          destinationQuery = destination;
          originQuery = origin;
          return server;
        } catch (ex) {
          return ex;
        }
      });
      afterEach(async () => {
        try {
          server.close();
          await TripModel.truncate();
        } catch (ex) {
          return ex;
        }
      });
      it('should return 200 if token, user_id is valid', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get('/api/v1/trips').send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(200);
          expect(Object.keys(res.body)).toEqual(['status', 'data']);
        } catch (ex) {
          return ex;
        }
      });
      it('should return 200 if token, user_id is valid with destination filtered query data', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get(`/api/v1/trips/?destination=${destinationQuery}`).send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(200);
          expect(Object.keys(res.body)).toEqual(['status', 'data']);
          expect(res.body.data[0].destination).toBe(`${destinationQuery}`);
        } catch (ex) {
          return ex;
        }
      });
      it('should return 404 if token, user_id is valid and destinationQuery data is not found', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get('/api/v1/trips/?destination=fake_destination').send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(404);
          expect(Object.keys(res.body)).toEqual(['status', 'error']);
          expect(res.body.error).toBe('No Trip found.');
        } catch (ex) {
          return ex;
        }
      });
      it('should return 200 if token, user_id is valid with origin filtered query data', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get(`/api/v1/trips/?origin=${originQuery}`).send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(200);
          expect(Object.keys(res.body)).toEqual(['status', 'data']);
          expect(res.body.data[0].origin).toBe(`${originQuery}`);
        } catch (ex) {
          return ex;
        }
      });
      it('should return 404 if token, user_id is valid and originQuery data is not found', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get('/api/v1/trips/?origin=fake_origin').send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(404);
          expect(Object.keys(res.body)).toEqual(['status', 'error']);
          expect(res.body.error).toBe('No Trip found.');
        } catch (ex) {
          return ex;
        }
      });
    });
  });
});


// PATCH - Trips Route
describe('/api/v1/tips/:tripId', () => {
  let data;
  beforeEach(async () => {
    try {
      data = await request(server).post('/api/v1/auth/signin').send({ email: 'admin@test.com', password: 'bananas123' });
      return server;
    } catch (ex) {
      return ex;
    }
  });
  afterEach(() => server.close());

  describe('PATCH /', () => {
    it('should return 401 if users is not logged in', async () => {
      try {
        const res = await request(server).patch('/api/v1/trips/1');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Access denied. No token provided.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).patch('/api/v1/trips/1').send({ token: 'invalid-token' });
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Invalid token.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 403 if user_id is invalid', async () => {
      try {
        const { token } = data.body.data;
        const res = await request(server).patch('/api/v1/trips/1').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if not Admin', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).patch('/api/v1/trips/1').send({ token, user_id: userId, is_admin: false });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User must be an Admin.');
        expect(res.body.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token, user_id is valid but no trip found', async () => {
      try {
        const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
        const res = await request(server).patch('/api/v1/trips/1').send({
          token,
          user_id: userId,
          is_admin: isAdmin,
        });
        expect(res.status).toBe(400);
        expect(Object.keys(res.body)).toEqual(['status', 'error']);
        expect(res.body.error).toBe('No trip found to cancelled.');
      } catch (ex) {
        return ex;
      }
    });
    describe('With trip found', () => {
      let tripId;
      beforeEach(async () => {
        try {
          const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
          const tripData = await request(server).post('/api/v1/trips').send({
            token,
            user_id: userId,
            is_admin: isAdmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          });
          const { trip_id: id } = tripData.body.data;
          tripId = id;
          return server;
        } catch (ex) {
          return ex;
        }
      });
      afterEach(async () => {
        try {
          server.close();
          await TripModel.truncate();
        } catch (ex) {
          return ex;
        }
      });
      it('should return 202 if token, user_id is valid and user is an admin', async () => {
        try {
          const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
          const res = await request(server).patch(`/api/v1/trips/${tripId}`).send({
            token,
            user_id: userId,
            is_admin: isAdmin,
          });
          expect(res.status).toBe(202);
          expect(Object.keys(res.body)).toEqual(['status', 'data']);
        } catch (ex) {
          return ex;
        }
      });
    });
  });
});
