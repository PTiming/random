const request = require('supertest');
const { app } = require('../server');

describe('Health Check', () => {
  it('should return OK status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});

describe('Authentication Routes', () => {
  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });
    
    expect(response.status).toBe(401);
  });

  it('should reject registration with missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com'
        // Missing required fields
      });
    
    expect(response.status).toBe(500);
  });
});
