const request = require('supertest');
const app = require('../../src/backend/app');

describe('GET /health', () => {
    it('responde 200 con {status:"ok"}', async () => {
        const res = await request(app).get('/health').expect(200);
        expect(res.body).toEqual({ status: 'ok' });
    });
});
