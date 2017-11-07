import {JSONSchema4} from 'json-schema';
import {
	buildPaginatedResponseSchema,
	getPaginationPageOptions,
	IRouteDefinition,
	paginationOptionsSchema,
	validateJsonSchema,
} from '../../../';
import {IServerContext} from '../../app';
import User from '../../models/User';

export interface IGetUserParameters {
	id: number;
}

export const responseSchema: JSONSchema4 = buildPaginatedResponseSchema({
	title: 'Users',
	description: 'List of paginated users',
	items: {
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
	},
});

export default (): IRouteDefinition<IServerContext> => ({
	path: '',
	method: 'get',
	metadata: {
		title: 'Get users',
		description: 'Returns list of paginated users',
		sinceVersion: '1.0.0',
		isDeprecated: false,
	},
	requestSchema: paginationOptionsSchema,
	responseSchema,
	handler: async (request, response, _next) => {
		const paginationOptions = getPaginationPageOptions(request.query, 3);
		const validationResult = await validateJsonSchema(paginationOptions, paginationOptionsSchema);

		if (!validationResult.isValid) {
			response.fail(validationResult.errors, responseSchema);

			return;
		}

		const result = await request.db.user.getPaginated(paginationOptions);

		response.paginatedSuccess<User>(result.items, paginationOptions, result.count, responseSchema);
	},
});
