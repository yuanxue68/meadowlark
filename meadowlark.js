//library imports
var express = require('express');
var handlebars = require('express3-handlebars').create({ 
	defaultLayout:'main',
	helper:{
		section:function(name,options){
			if(!this._sections)
				this._sections={};
			this._sections[name]=options.fn(this);
			return null;
		}
	} 
});
var jqupload = require('jquery-file-upload-middleware');
var formidable=require('formidable');
var credentials=require('./credentials.js');
var fortune=require('./lib/fortune.js');
var cartValidation=require('./lib/cartValidation.js');
var nodemailer=require('nodemailer');

//app initialization
var app = express();
app.use(require('body-parser')());
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname+'/public'));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());
app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

var mailTransport=nodemailer.createTransport('SMTP',{
	service:"Gmail",
	auth: {
		user:credentials.gmail.user,
		pass:credentials.gmail.password,
	}
})
//set up test
app.use(function(req,res,next){
	res.locals.showTests=app.get('env')!=='prodution'&&req.query.test==='1';
	next();
});

app.use(function(req,res,next){
	if(!res.locals.partials)
		res.locals.partials={};
	res.locals.partials.weather=getWeatherData();
	next();
});

app.use('/upload', function(req, res, next){
	var now = Date.now();
	jqupload.fileHandler({
		uploadDir: function(){
		return __dirname + '/public/uploads/' + now;
		},
		uploadUrl: function(){
		return '/uploads/' + now;
		},
	})(req, res, next);
});

app.use(function(req,res,next){
	res.locals.flash=req.session.flash;
	delete req.session.flashl
	next();
})

//route to index
app.get('/',function(req,res){
	res.render('home');
});
//route to about
app.get('/about',function(req,res){
	res.render('about',{
		fortune:fortune.getFortune(),
		pageTestScript:'/qa/tests-about.js'
	});
});

app.get('/tours/ho od-river',function(req,res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function(re,res){
	res.render('tours/request-group-rate');
});

app.get('/thank-you',function(re,res){
	res.render('thank-you');
});

app.get('/newsletter',function(req,res){
	res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.get('/contest/vacation-photo',function(req,res){
	var now=new Date();
	res.render('contest/vacation-photo',{
		year:now.getFullYear(),
		month:now.getMonth()
	});
});

app.post('/contest/vacation-photo/:year/:month', function(req, res){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err)
			return res.redirect(303,'/error');
		console.log('received fields:');
		console.log(fields);
		console.log('received files:');
		console.log(files);
		res.redirect(303, '/thank-you');
	});
});

app.post('/process', function(req, res){
	if(req.xhr || req.accepts('json,html')==='json'){
	// if there were an error, we would send { error: 'error description' }
		res.send({ success: true });
	} else {
	// if there were an error, we would redirect to an error page
		res.redirect(303, '/thank-you');
	}
});

// custom 404 page
app.use(function(req, res){
	res.status(404);
	res.render('404');
});
// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});
app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
	app.get('port') + '; press Ctrl-C to terminate.' );
});

function getWeatherData(){
	return {
		locations: [
		{
			name: 'Portland',
			forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
			weather: 'Overcast',
			temp: '54.1 F (12.3 C)',
		},
		{
			name: 'Bend',
			forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
			weather: 'Partly Cloudy',
			temp: '55.0 F (12.8 C)',
		},
		{
			name: 'Manzanita',
			forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
			iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
			weather: 'Light Rain',
			temp: '55.0 F (12.8 C)',
		},
		],
	};
}