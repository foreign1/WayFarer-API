/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
const httpMocks = require('node-mocks-http');
const UserController = require('../../../src/controllers/users');
const UserMiddleware = require('../../../src/middlewares/users');

// SignUp
describe('User Signup Route - POST /api/v1/auth/signup', () => {
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
      await UserController.signUpUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(201);
      expect(Object.keys(data)).toEqual(['status', 'data']);
      expect(data.status).toBe('success');
      expect(Object.keys(data.data).length).toBe(3);
      expect(data.data.user_id).toMatch(/\d{1,}/);
      expect(data.data.is_admin).toEqual(false);
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
      await UserController.signUpUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.error).toBe('User already registered');
      expect(data.status).toBe('error');
    });
    it('should return "email" is required with 400 status code if request body is empty', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/users',
        body: {},
      });
      const response = httpMocks.createResponse();
      await UserMiddleware.validateSignUpUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.error).toBe('"email" is required');
      expect(data.status).toBe('error');
    });
  });
});

describe('Admin User Signup Route - POST /api/v1/admin/auth/signup', () => {
  describe('Admin User can register - ', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/admin/auth/signup',
      body: {
        email: 'newuser@test.com',
        first_name: 'New',
        last_name: 'User',
        password: '12345',
      },
    });
    const response = httpMocks.createResponse();
    afterEach(() => UserController.deleteUser(request, response));
    it('should create a new admin user', async () => {
      await UserController.signUpUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(201);
      expect(Object.keys(data)).toEqual(['status', 'data']);
      expect(data.status).toBe('success');
      expect(Object.keys(data.data).length).toBe(3);
      expect(data.data.user_id).toMatch(/\d{1,}/);
      expect(data.data.is_admin).toEqual(true);
    });
  });
});

// SignIn
describe('User Signin Route - POST /api/v1/auth/signin', () => {
  describe('User can login - ', () => {
    const request = httpMocks.createRequest({
      method: 'POST',
      url: '/api/v1/auth/signin',
      body: {
        email: 'admin@test.com',
        password: 'bananas123',
      },
    });
    const response = httpMocks.createResponse();
    it('should login user', async () => {
      await UserController.signInUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(201);
      expect(Object.keys(data)).toEqual(['status', 'data']);
      expect(data.status).toBe('success');
      expect(Object.keys(data.data).length).toBe(3);
      expect(data.data.user_id).toMatch(/\d{1,}/);
    });
  });
  describe('User can not login - ', () => {
    it('should return 400 status code if user is not registered', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/auth/signin',
        body: {
          email: 'newuser@test.com',
          password: '12345',
        },
      });
      const response = httpMocks.createResponse();
      await UserController.signInUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.error).toBe('Invalid email');
      expect(data.status).toBe('error');
    });
    it('should return "email" is required with 400 status code if request body is empty', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/users',
        body: {},
      });
      const response = httpMocks.createResponse();
      await UserMiddleware.validateSignInUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.error).toBe('"email" is required');
      expect(data.status).toBe('error');
    });
    it('should return "password" is required with 400 status code if request body is empty', async () => {
      const request = httpMocks.createRequest({
        method: 'POST',
        url: '/api/v1/users',
        body: {
          email: 'newuser@test.com',
        },
      });
      const response = httpMocks.createResponse();
      await UserMiddleware.validateSignInUser(request, response);
      const data = response._getJSONData();
      expect(response.statusCode).toBe(400);
      expect(data.error).toBe('"password" is required');
      expect(data.status).toBe('error');
    });
  });
});
