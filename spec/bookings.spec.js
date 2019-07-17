/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import request from 'supertest';
import server from '../src/index';
import Model from '../src/models/Model';

const BookingModel = new Model('booking');
const TripModel = new Model('trip');

// POST - Bookings Route
describe('/api/v1/bookings', () => {
  let data;
  let tripId;
  beforeEach(async () => {
    try {
      data = await request(server).post('/api/v1/auth/signin').send({ email: 'admin@test.com', password: 'bananas123' });
      const { user_id: userId, is_admin: isAdmin, token } = data.body.data;
      const data2 = await request(server).post('/api/v1/trips').send({
        token,
        is_admin: isAdmin,
        user_id: userId,
        bus_id: 1,
        origin: 'PH',
        destination: 'Abuja',
        trip_date: '2019-09-12',
        fare: 50000,
      });
      const { trip_id: tripNo } = data2.body.data;
      tripId = tripNo;
      return server;
    } catch (ex) {
      return ex;
    }
  });

  describe('POST /', () => {
    afterEach(async () => {
      try {
        server.close();
        await BookingModel.truncate();
        await TripModel.truncate();
      } catch (ex) {
        return ex;
      }
    });
    it('should return 401 if users is not logged in', async () => {
      try {
        const res = await request(server).post('/api/v1/bookings');
        expect(res.status).toBe(401);
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).post('/api/v1/bookings').send({ token: 'invalid-token' });
        expect(res.status).toBe(400);
      } catch (ex) {
        return ex;
      }
    });
    it('should return 403 if user_id is invalid', async () => {
      try {
        const { token } = data.body.data;
        const res = await request(server).post('/api/v1/bookings').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if trip_id is invalid', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).post('/api/v1/bookings').send({ token, user_id: userId, trip_id: -1 });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Trip not created');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 201 if token, user_id and trip_id is valid', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).post('/api/v1/bookings').send({ token, user_id: userId, trip_id: tripId });
        expect(res.status).toBe(201);
        expect(Object.keys(res.body)).toEqual(['status', 'data']);
      } catch (ex) {
        return ex;
      }
    });
  });
});


// GET - Bookings Route
describe('/api/v1/bookings', () => {
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
        const res = await request(server).get('/api/v1/bookings');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Access denied. No token provided.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).get('/api/v1/bookings').send({ token: 'invalid-token' });
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
        const res = await request(server).get('/api/v1/bookings').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 404 if token, user_id is valid but no booking found', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).get('/api/v1/bookings').send({
          token,
          user_id: userId,
        });
        expect(res.status).toBe(404);
        expect(Object.keys(res.body)).toEqual(['status', 'error']);
        expect(res.body.error).toBe('No Booking found.');
      } catch (ex) {
        return ex;
      }
    });
    describe('With booking found', () => {
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
          const { trip_id: tripId } = tripData.body.data;
          await request(server).post('/api/v1/bookings').send({ token, user_id: userId, trip_id: tripId });
          return server;
        } catch (ex) {
          return ex;
        }
      });
      afterEach(async () => {
        try {
          server.close();
          await TripModel.truncate();
          await BookingModel.truncate();
        } catch (ex) {
          return ex;
        }
      });
      it('should return 200 if token, user_id is valid', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).get('/api/v1/bookings').send({
            token,
            user_id: userId,
          });
          expect(res.status).toBe(200);
          expect(Object.keys(res.body)).toEqual(['status', 'data']);
        } catch (ex) {
          return ex;
        }
      });
    });
  });
});

// DELETE - Bookings Route
describe('/api/v1/bookings/:bookingsId', () => {
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

  describe('DELETE /', () => {
    it('should return 401 if users is not logged in', async () => {
      try {
        const res = await request(server).delete('/api/v1/bookings/1');
        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(res.body.error).toBe('Access denied. No token provided.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token is invalid', async () => {
      try {
        const res = await request(server).delete('/api/v1/bookings/1').send({ token: 'invalid-token' });
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
        const res = await request(server).delete('/api/v1/bookings/1').send({ token });
        expect(res.status).toBe(403);
        expect(res.body.error).toBe('Access denied. User not registered.');
      } catch (ex) {
        return ex;
      }
    });
    it('should return 400 if token, user_id is valid but no booking found', async () => {
      try {
        const { user_id: userId, token } = data.body.data;
        const res = await request(server).delete('/api/v1/bookings/1').send({
          token,
          user_id: userId,
        });
        expect(res.status).toBe(400);
        expect(Object.keys(res.body)).toEqual(['status', 'error']);
        expect(res.body.error).toBe('No Booking found to delete.');
      } catch (ex) {
        return ex;
      }
    });
    describe('With booking found', () => {
      let bookingId;
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
          const { trip_id: tripId } = tripData.body.data;
          const bookingData = await request(server).post('/api/v1/bookings').send({ token, user_id: userId, trip_id: tripId });
          const { booking_id: id } = bookingData.body.data;
          bookingId = id;
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
      it('should return 202 if token, user_id is valid', async () => {
        try {
          const { user_id: userId, token } = data.body.data;
          const res = await request(server).delete(`/api/v1/bookings/${bookingId}`).send({
            token,
            user_id: userId,
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
