/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const UserController = require('../../../src/controllers/users');
const UserMiddleware = require('../../../src/middlewares/users');
const { checkAdminRoute } = require('../../../src/helpers/errorHandler');

describe('User Signup Route POST /api/v1/auth/signup', () => {
  describe('User can register - ', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signup',
      body: {
        email: 'newuser@test.com',
        first_name: 'New',
        last_name: 'User',
        password: '12345',
      },
    });
    const response = httpMocks.createResponse();
    afterEach(() => UserController.deleteUser(request, response));
    it('should create a new user', async () => {
      await UserController.addUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(201);
      expect(Object.keys(data)).toEqual(['data', 'message', 'status']);
      expect(data.message).toBe('User was added successfully');
      expect(data.status).toBe('USER_ADDED');
      expect(Object.keys(data.data[0]).length).toBe(5);
      expect(data.data[0].email).toEqual(request.body.email);
      expect(data.data[0].first_name).toEqual(request.body.first_name);
      expect(data.data[0].last_name).toEqual(request.body.last_name);
      expect(data.data[0].is_admin).toEqual(false);
    });
  });
  describe('User can not register - ', () => {
    it('should return 400 status code if user already registered', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/auth/signup',
        body: {
          email: 'admin@test.com',
          first_name: 'Richard',
          last_name: 'Smith',
          password: 'bananas123',
        },
      });
      const response = httpMocks.createResponse();
      await UserController.addUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.message).toBe('User already registered');
    });
    it('should return 400 status code if request body is empty', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/users',
        body: {},
      });
      const response = httpMocks.createResponse();
      await UserMiddleware.validateUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.message).toBe('"email" is required');
    });
  });
});

describe('Admin User Signup Route POST /api/v1/admin/auth/signup', () => {
  describe('Admin User can register - ', () => {
    const role = checkAdminRoute('/api/v1/admin/auth/signup') ? 'true' : 'false';
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/admin/auth/signup',
      body: {
        email: 'newuser@test.com',
        first_name: 'New',
        last_name: 'User',
        password: '12345',
        is_admin: role,
      },
    });
    const response = httpMocks.createResponse();
    afterEach(() => UserController.deleteUser(request, response));
    it('should create a new admin user', async () => {
      await UserController.addUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(201);
      expect(Object.keys(data)).toEqual(['data', 'message', 'status']);
      expect(data.message).toBe('User was added successfully');
      expect(data.status).toBe('USER_ADDED');
      expect(Object.keys(data.data[0]).length).toBe(5);
      expect(data.data[0].email).toEqual(request.body.email);
      expect(data.data[0].first_name).toEqual(request.body.first_name);
      expect(data.data[0].last_name).toEqual(request.body.last_name);
      expect(data.data[0].is_admin).toEqual(true);
    });
  });
});
