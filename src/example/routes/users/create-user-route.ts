import {normalizeType} from 'normalize-type';
import {buildResponseSchema, ICustomValidator, IRouteDefinition, JSONSchema4, validateJsonSchema} from '../../../';
import {IServerContext} from '../../app';
import validateUniqueEmail from '../../validators/validateUniqueEmail';
import {IUser, transformUser, userSchema} from './users';

export interface ICreateUserRequest {
	name: string;
	email: string;
}

export const requestSchema: JSONSchema4 = {
	title: 'Create user',
	description: 'Create a new user account',
	type: 'object',
	properties: {
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
			allOf: [
				{
					format: 'email',
				},
				{
					format: 'unique-email',
				},
			],
		},
	},
	required: ['name', 'email'],
};

export const responseSchema: JSONSchema4 = buildResponseSchema(userSchema);

export default (): IRouteDefinition<IServerContext> => ({
	path: '',
	method: 'post',
	metadata: {
		title: 'Register user',
		description: 'Register a new user account',
		sinceVersion: '1.0.0',
		isDeprecated: false,
	},
	requestSchema,
	responseSchema,
	handler: async (request, response, _next) => {
		const requestData = normalizeType<ICreateUserRequest>(request.body);
		const validators: ICustomValidator[] = [validateUniqueEmail(request.db.user)];
		const validationResult = await validateJsonSchema(requestData, requestSchema, validators);

		if (!validationResult.isValid) {
			response.fail(validationResult.errors, responseSchema, validators);

			return;
		}

		const user = await request.db.user.save(requestData);

		response.success<IUser>(transformUser(user), responseSchema, validators);
	},
});
