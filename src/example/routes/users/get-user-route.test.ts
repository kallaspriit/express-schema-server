import * as supertest from 'supertest';
import setupApp from '../../app';
import {transformUser} from './users';

let app: supertest.SuperTest<supertest.Test>;

describe('get-user-route', () => {
	beforeEach(async () => {
		app = supertest(await setupApp());
	});

	it('should return registered user info', async () => {
		const createResponse = await app.post('/users').send({
			name: 'Jack Daniels',
			email: 'jack@daniels.com',
		});

		expect(createResponse.status).toEqual(200);
		expect(createResponse.body.success).toBe(true);
		expect(createResponse.body.payload).toMatchSnapshot();

		const getResponse = await app.get(`/users/${createResponse.body.payload.id}`).send();

		expect(getResponse.status).toEqual(200);
		expect(getResponse.body.success).toBe(true);
		expect(getResponse.body.payload).toMatchSnapshot();
	});

	it('should return validation error for invalid user id', async () => {
		const getResponse = await app.get('/users/abc').send();

		expect(getResponse.status).toEqual(400);
		expect(getResponse.body.success).toBe(false);
		expect(getResponse.body.validationErrors).toMatchSnapshot();
	});

	it('should return 404 not found for non-existing user', async () => {
		const getResponse = await app.get(`/users/666`).send();

		expect(getResponse.status).toEqual(404);
		expect(getResponse.text).toMatchSnapshot();
	});

	it('transformUser removes excessive data', async () => {
		const fullInfo = {
			name: 'Jack Daniels',
			email: 'jack@daniels.com',
			password: 'xxx',
		};

		const transformedInfo = transformUser(fullInfo);

		expect(transformedInfo).toMatchSnapshot();
	});
});
