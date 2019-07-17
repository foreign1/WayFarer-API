/* eslint-disable consistent-return */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
const httpMocks = require('node-mocks-http');
const TripController = require('../src/controllers/trips');
const TripMiddleware = require('../src/middlewares/trips');
const UserController = require('../src/controllers/users');

// POST - Trips Route
describe('Can user create trips Route - POST /api/v1/trips', () => {
  let data;

  describe('If user has valid token and admin role', () => {
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
          url: '/api/v1/trips',
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

  describe('If user_id is invalid', () => {
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
    it('should return forbidden error response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trips',
          body: {
            token: data.data.token,
            user_id: 0,
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
        expect(res.statusCode).toBe(403);
        expect(result.error).toBe('Access denied. User not registered.');
        expect(result.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
  });

  describe('If token is not provided', () => {
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
          url: '/api/v1/trips',
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

  describe('If token is invalid', () => {
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
          url: '/api/v1/trips',
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

  describe('If user do not have admin role', () => {
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
          url: '/api/v1/trips',
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


// GET - Trips Route
describe('Can user get trips Route - GET /api/v1/trips', () => {
  describe('If user has valid token', () => {
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
          method: 'GET',
          url: '/api/v1/trips',
          body: {
            token: data.data.token,
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
          },
        });
        const res = httpMocks.createResponse();
        await TripController.getTrips(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(200);
        expect(Object.keys(result)).toEqual(['status', 'data']);
        expect(result.data[0].trip_id && result.data[0].bus_id).toMatch(/\d{1,}/);
        expect(Object.keys(result.data[0]).length).toBe(7);
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If token is invalid', () => {
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
          method: 'GET',
          url: '/api/v1/trips',
          body: {
            token: 'faketoken',
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
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
  describe('If user_id is invalid', () => {
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
    it('should return forbidden error response', async () => {
      try {
        const req = httpMocks.createRequest({
          method: 'POST',
          url: '/api/v1/trips',
          body: {
            token: data.data.token,
            user_id: 0,
            is_admin: data.data.isadmin,
          },
        });
        const res = httpMocks.createResponse();
        await TripMiddleware.auth(req, res);
        const result = res._getJSONData();
        expect(res.statusCode).toBe(403);
        expect(result.error).toBe('Access denied. User not registered.');
        expect(result.status).toBe('error');
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If token is not provided', () => {
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
          method: 'GET',
          url: '/api/v1/trips',
          body: {
            user_id: data.data.user_id,
            is_admin: data.data.isadmin,
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
});
