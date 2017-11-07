import * as supertest from 'supertest';
import setupApp from './example/app';
import {ICustomValidator, JSONSchema4, validateJsonSchema} from './index';

let app: supertest.SuperTest<supertest.Test>;

const normalSchema: JSONSchema4 = {
	title: 'Test schema',
	description: 'Testing JSON schema',
	type: 'object',
	properties: {
		name: {
			title: 'Name',
			description: 'User name',
			type: 'string',
			minLength: 3,
		},
	},
	required: ['name'],
};

const errorSchema: JSONSchema4 = {
	title: 'Test schema',
	description: 'Testing JSON schema',
	type: 'object',
	properties: {
		name: {
			title: 'Name',
			description: 'User name',
			type: 'string',
			minLength: 3,
			format: 'throws-error',
		},
	},
	required: ['name'],
};

function validateThrowsError(): ICustomValidator {
	return {
		name: 'throws-error',
		validate: async (_value: string) => {
			throw new Error('Validator error message');
		},
	};
}

describe('get-user-route', () => {
	beforeEach(async () => {
		app = supertest(await setupApp());
	});

	it('provides schema endpoint', async () => {
		const getResponse = await app.get(`/schema`).send();

		expect(getResponse.status).toEqual(200);
		expect(getResponse.body.text).toMatchSnapshot();
	});

	it('performs valid json schema validation', async () => {
		const data = {
			name: 'Jack Daniels',
		};

		const validationResult = await validateJsonSchema(data, normalSchema);

		expect(validationResult).toMatchSnapshot();
	});

	it('performs invalid json schema validation', async () => {
		const data = {
			name: 'J', // too short
		};

		const validationResult = await validateJsonSchema(data, normalSchema);

		expect(validationResult).toMatchSnapshot();
	});

	it('schema validation fails if missing validator', async () => {
		const data = {
			name: 'Jack Daniels',
		};

		const validationResult = await validateJsonSchema(data, errorSchema, [validateThrowsError()]);

		expect(validationResult).toMatchSnapshot();
	});
});
