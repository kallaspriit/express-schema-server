import {IRouteDefinition} from '../../index';
import {IServerContext} from '../app';

export default (): IRouteDefinition<IServerContext> => ({
	path: '/',
	method: 'get',
	metadata: {
		title: 'API index',
		description: 'Displays useful information about using the API',
		sinceVersion: '1.0.0',
		isDeprecated: false,
	},
	requestSchema: {},
	responseSchema: {},
	handler: (request, response, _next) => {
		response.send(`
      <h1>Index</h1>
      <p>This page is served from <strong>src/example/routes/index-route.ts</strong></p>

      <h2>Schemas</h2>
      <ul>
        <li><a href="${request.baseUrl}/schema">json schema index for all endpoints</a></li>
        <li><a href="${request.baseUrl}/schema/users/post">json schema example for a specific endpoint</a></li>
      </ul>

      <h2>Create user</h2>
      <form method="post" action="/users" target="create-user-frame">
        <div><label><input type="text" name="name" value=""/> Name</label></div>
        <div><label><input type="text" name="email" value=""/> Email</label></div>
        <div><input type="submit" name="submit" value="Submit"/></div>
      </form>
      <iframe name="create-user-frame" style="width: 400px; height: 300px"></iframe>

      <h2>Get user</h2>
      <ul>
        <li><a href="/users/1" target="get-user-frame">Get user #1</a></li>
        <li><a href="/users/2" target="get-user-frame">Get user #2</a></li>
        <li><a href="/users/3" target="get-user-frame">Get user #3</a></li>
      </ul>
      <iframe name="get-user-frame" style="width: 400px; height: 300px"></iframe>
    `);
	},
});
