module.exports={
	cookieSecret:'your cookie secret goes here',
	gmail:{
		user: 'youremail@email.com',
		password: '123456',
	},
	mongo: {
		development: {
			connectionString: 'your_dev_connection_string',
		},
		production: {
			connectionString: 'your_production_connection_string',
		},
	},
};