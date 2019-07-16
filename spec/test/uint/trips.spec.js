/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const TripController = require('../../../src/controllers/trips');
const TripMiddleware = require('../../../src/middlewares/trips');
const UserController = require('../../../src/controllers/users');

describe('Create Trips Route - /api/v1/trip', () => {
  let data;

  // Admin User can create trip
  describe('Admin can create trip', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signin',
      body: {
        email: 'admin@test.com',
        password: 'bananas123',
      },
    });
    const response = httpMocks.createResponse();
    beforeEach(async () => {
      try {
        await UserController.signInUser(request, response);
        data = response._getJSONData();
      } catch (ex) {
        return ex;
      }
    });
    it('should return success response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trip',
          body: {
            token: data.data.token,
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          },
        });
        const res = httpMocks.createResponse();
        await TripController.createTrip(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(201);
        expect(Object.keys(result)).toEqual(['status', 'data']);
        expect(result.data.trip_id && result.data.bus_id).toMatch(/\d{1,}/);
        expect(Object.keys(result.data).length).toBe(7);
      } catch (ex) {
        return ex;
      }
    });
  });

  // Admin User can not create trip with out a token
  describe('Admin can not create trip with out a token', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signin',
      body: {
        email: 'admin@test.com',
        password: 'bananas123',
      },
    });
    const response = httpMocks.createResponse();
    beforeEach(async () => {
      try {
        await UserController.signInUser(request, response);
        data = response._getJSONData();
      } catch (ex) {
        return ex;
      }
    });
    it('should return unauthorized error response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trip',
          body: {
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          },
        });
        const res = httpMocks.createResponse();
        await TripMiddleware.auth(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(401);
        expect(result.error).toBe('Access denied. No token provided.');
        expect(result.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
  });

  // Admin User can not create trip with invalid token
  describe('Admin can not create trip with invalid token', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signin',
      body: {
        email: 'admin@test.com',
        password: 'bananas123',
      },
    });
    const response = httpMocks.createResponse();
    beforeEach(async () => {
      try {
        await UserController.signInUser(request, response);
        data = response._getJSONData();
      } catch (ex) {
        return ex;
      }
    });
    it('should return bad request error response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trip',
          body: {
            token: 'invalid.token',
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          },
        });
        const res = httpMocks.createResponse();
        await TripMiddleware.auth(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(400);
        expect(result.error).toBe('Invalid token.');
        expect(result.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
  });

  // User with out admin role can not create trip
  describe('User with out admin role can not create trip', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signin',
      body: {
        email: 'john@test.com',
        password: 'avocados123',
      },
    });
    const response = httpMocks.createResponse();
    beforeEach(async () => {
      try {
        await UserController.signInUser(request, response);
        data = response._getJSONData();
      } catch (ex) {
        return ex;
      }
    });
    it('should return unauthorized error response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trip',
          body: {
            token: data.data.token,
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
            bus_id: 1,
            origin: 'Abuja',
            destination: 'Lagos',
            trip_date: '2019-09-12',
            fare: 20000,
          },
        });
        const res = httpMocks.createResponse();
        await TripMiddleware.admin(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(403);
        expect(result.error).toBe('Access denied. User must be an Admin.');
        expect(result.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
  });
});
