import {JSONSchema4} from 'json-schema';
import {normalizeType} from 'normalize-type';
import {buildResponseSchema, IRouteDefinition, validateJsonSchema} from '../../../';
import {IServerContext} from '../../app';
import User from '../../models/User';

export interface IGetUserParameters {
	id: number;
}

export const requestSchema: JSONSchema4 = {
	title: 'Get user parameters',
	description: 'Parameters for getting user info',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			title: 'Id',
			description: 'User id',
			minimum: 1,
		},
	},
	required: ['id'],
};

export const responseSchema: JSONSchema4 = buildResponseSchema({
	title: 'User info',
	description: 'Registered user info',
	type: 'object',
	properties: {
		id: {
			type: 'number',
			title: 'Id',
			description: 'User id',
			minimum: 1,
		},
		name: {
			type: 'string',
			title: 'Name',
			description: 'User name',
			minLength: 3,
			maxLength: 100,
		},
		email: {
			type: 'string',
			title: 'Email',
			description: 'Email address',
			minLength: 3,
			maxLength: 256,
			format: 'email',
		},
	},
	required: ['name', 'email'],
});

export default (): IRouteDefinition<IServerContext> => ({
	path: '/:id',
	method: 'get',
	metadata: {
		title: 'Get user info',
		description: 'Returns registered user info by email',
		sinceVersion: '1.0.0',
		isDeprecated: false,
	},
	requestSchema,
	responseSchema,
	handler: async (request, response, _next) => {
		const requestData = normalizeType<IGetUserParameters>(request.params);
		const validationResult = await validateJsonSchema(requestData, requestSchema);

		if (!validationResult.isValid) {
			response.fail(validationResult.errors, responseSchema);

			return;
		}

		const user = await request.db.user.getById(requestData.id);

		if (!user) {
			response.status(404).send(`User with id "${requestData.id}" could not be found`);

			return;
		}

		response.success<User>(user, responseSchema);
	},
});
