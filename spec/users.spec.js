/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import httpMocks from 'node-mocks-http';
import UserController from '../src/controllers/users';
import UserMiddleware from '../src/middlewares/users';
import Model from '../src/models/Model';

const UserModel = new Model('users');

// SignUp
describe('Can user signup Route - POST /api/v1/auth/signup', () => {
  describe('If email, first_name, lastname and password is valid - ', () => {
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
    afterEach(async () => UserModel.delete('WHERE email=\'newuser@test.com\''));
    it('should create a new user', async () => {
      try {
        await UserController.signUpUser(request, response);
        const data = response._getJSONData();
        expect(response.statusCode).toBe(201);
        expect(Object.keys(data)).toEqual(['status', 'data']);
        expect(data.status).toBe('success');
        expect(Object.keys(data.data)).toEqual(['user_id', 'is_admin', 'token']);
        expect(data.data.user_id).toMatch(/\d{1,}/);
        expect(data.data.is_admin).toEqual(false);
        expect(data.data.token).toMatch(/e/);
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If user is already registered - ', () => {
    it('should return 400 status code', async () => {
      try {
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
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If request body is empty - ', () => {
    it('should return "email" is required with 400 status code', async () => {
      try {
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
      } catch (ex) {
        return ex;
      }
    });
  });
});

describe('Can admin user signup Route - POST /api/v1/admin/auth/signup', () => {
  describe('If email, first_name, lastname and password is valid - ', () => {
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
    afterEach(async () => UserModel.delete('WHERE email=\'newuser@test.com\''));
    it('should create a new admin user', async () => {
      try {
        await UserController.signUpUser(request, response);
        const data = response._getJSONData();
        expect(response.statusCode).toBe(201);
        expect(Object.keys(data)).toEqual(['status', 'data']);
        expect(data.status).toBe('success');
        expect(Object.keys(data.data)).toEqual(['user_id', 'is_admin', 'token']);
        expect(data.data.user_id).toMatch(/\d{1,}/);
        expect(data.data.is_admin).toEqual(true);
        expect(data.data.token).toMatch(/e/);
      } catch (ex) {
        return ex;
      }
    });
  });
});

// SignIn
describe('Can user signin Route - POST /api/v1/auth/signin', () => {
  describe('If email and password is valid - ', () => {
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
      try {
        await UserController.signInUser(request, response);
        const data = response._getJSONData();
        expect(response.statusCode).toBe(201);
        expect(Object.keys(data)).toEqual(['status', 'data']);
        expect(data.status).toBe('success');
        expect(Object.keys(data.data).length).toBe(3);
        expect(Object.keys(data.data)).toEqual(['user_id', 'is_admin', 'token']);
        expect(data.data.user_id).toMatch(/\d{1,}/);
        expect(data.data.is_admin).toBe(true);
        expect(data.data.token).toMatch(/e/);
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If user is not registered - ', () => {
    it('should return 400 status code', async () => {
      try {
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
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If request body is empty - ', () => {
    it('should return "email" is required with 400 status code', async () => {
      try {
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
      } catch (ex) {
        return ex;
      }
    });
  });
  describe('If request body has only email - ', () => {
    it('should return "password" is required with 400 status code', async () => {
      try {
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
      } catch (ex) {
        return ex;
      }
    });
  });
});
