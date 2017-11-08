import * as supertest from 'supertest';
import setupApp from '../../app';

let app: supertest.SuperTest<supertest.Test>;

describe('authentication-route', () => {
	beforeEach(async () => {
		app = supertest(await setupApp());
	});

	it('should return logged in user message', async () => {
		const response = await app
			.get('/auth/login')
			.auth('jack', 'daniels')
			.send();

		expect(response.status).toEqual(200);
		expect(response.body.success).toBe(true);
		expect(response.body.payload).toMatchSnapshot();
	});
});
