import setupApp from './app';

// setup and start the app
setupApp().then(app => {
	app.listen(3000, () => {
		console.log('server started on port 3000');
	});
});
