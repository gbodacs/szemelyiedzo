var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function (app) {

	/*
		login & logout
	*/

	app.get('/', function (req, res) {
		// check if the user has an auto login key saved in a cookie //
		if (req.cookies.login == undefined) {
			res.render('login', {
				title: 'Hello - Please Login To Your Account'
			});
		} else {
			// attempt automatic login //
			AM.validateLoginKey(req.cookies.login, req.ip, function (e, o) {
				if (o) {
					AM.autoLogin(o.user, o.pass, function (o) {
						req.session.user = o;
						res.redirect('/user_settings');
					});
				} else {
					res.render('login', {
						title: 'Üdv, lépj be a felhasználóddal.'
					});
				}
			});
		}
	});

	app.post('/', function (req, res) {
		AM.manualLogin(req.body['user'], req.body['pass'], function (e, o) {
			if (!o) {
				res.status(400).send(e);
			} else {
				req.session.user = o;
				if (req.body['remember-me'] == 'false') {
					res.status(200).send(o);
				} else {
					AM.generateLoginKey(o.user, req.ip, function (key) {
						res.cookie('login', key, {
							maxAge: 900000
						});
						res.status(200).send(o);
					});
				}
			}
		});
	});

	app.post('/logout', function (req, res) {
		res.clearCookie('login');
		req.session.destroy(function (e) {
			res.status(200).send('ok');
		});
	})

	app.get('/logout', function (req, res) {
		res.clearCookie('login');
		req.session.destroy(function (e) {
			//res.status(200).send('ok');
			res.redirect('/');
		});
	})

	/*
		ADMIN - DailyPlan
	*/
	app.get('/admin_dailyplan', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('admin_dailyplan', {excers: excercise});
		}
	});

	app.post('/admin_dailyplan', function (req, res) 
	{
		if (req.session.user == null) 
		{
			res.redirect('/');
		} else 
		{
			/*AM.addNewExcercise({
				name		: req.body['name2'],
				movielink	: req.body['movielink'],
				unit		: req.body['unit'],
				comment		: req.body['comment']
			}, function(e, o)
			{
				if (e)
				{
					res.status(400).send('error-adding-excercise');
				}	else
				{
					//req.session.user = o.value;
					res.status(200).send('ok');
				}
			});*/
		}
	});

	/*
		ADMIN - Users
	*/
	app.get('/admin_users', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('admin_users', {excers: excercise});
		}
	});

	app.post('/admin_users', function (req, res) 
	{
		if (req.session.user == null) 
		{
			res.redirect('/');
		} else 
		{
			/*AM.addNewExcercise({
				name		: req.body['name2'],
				movielink	: req.body['movielink'],
				unit		: req.body['unit'],
				comment		: req.body['comment']
			}, function(e, o)
			{
				if (e)
				{
					res.status(400).send('error-adding-excercise');
				}	else
				{
					//req.session.user = o.value;
					res.status(200).send('ok');
				}
			});*/
		}
	});

	/*
		ADMIN - Excercise
	*/
	app.get('/admin_excercise', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('admin_excercise', {
				countries: CT,
				//			udata : req.session.user
			});
		}
	});

	app.post('/admin_excercise', function (req, res) 
	{
		if (req.session.user == null) 
		{
			res.redirect('/');
		} else 
		{
			AM.addNewExcercise({
				name		: req.body['name2'],
				movielink	: req.body['movielink'],
				unit		: req.body['unit'],
				comment		: req.body['comment']
			}, function(e, o)
			{
				if (e)
				{
					res.status(400).send('error-adding-excercise');
				}	else
				{
					//req.session.user = o.value;
					res.status(200).send('ok');
				}
			});
		}
	});

	/*
		ADMIN - Block
	*/

	app.get('/admin_block', function (req, res) 
	{
		if (req.session.user == null) 
		{
			res.redirect('/');
		} else 
		{
			AM.getAllExcercise(function (e, excercise) 
			{
				res.render('admin_block', {excers: excercise});
			})
		}
	});

	app.post('/admin_block', function (req, res) 
	{
		if (req.session.user == null) 
		{
			res.redirect('/');
		} else 
		{
			AM.addNewBlock({
				name		: req.body['name2'],
				movielink	: req.body['movielink'],
				unit		: req.body['unit'],
				comment		: req.body['comment']
			}, function(e, o)
			{
				if (e)
				{
					res.status(400).send('error-adding-block');
				}	else
				{
					//req.session.user = o.value;
					res.status(200).send('ok');
				}
			});
		}
	});



	/*
		Settings
	*/

	app.get('/user_settings', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('user_settings', {
				title: 'Beállítások',
				countries: CT,
				udata: req.session.user
			});
		}
	});

	app.post('/user_settings', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			AM.updateAccount({
				id: req.session.user._id,
				name: req.body['name'],
				email: req.body['email'],
				pass: req.body['pass'],
				country: req.body['country']
			}, function (e, o) {
				if (e) {
					res.status(400).send('error-updating-account');
				} else {
					req.session.user = o.value;
					res.status(200).send('ok');
				}
			});
		}
	});

	/*
		User history
	*/

	app.get('/user_history', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('user_history', {
				title: 'Napi terved',
				countries: CT,
				udata: req.session.user
			});
		}
	});

	app.post('/user_history', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			/*AM.updateAccount({
				id: req.session.user._id,
				name: req.body['name'],
				email: req.body['email'],
				pass: req.body['pass'],
				country: req.body['country']
			}, function (e, o) {
				if (e) {
					res.status(400).send('error-updating-account');
				} else {
					req.session.user = o.value;
					res.status(200).send('ok');
				}
			});*/
		}
	});

	/*
		User dailyplan
	*/

	app.get('/user_dailyplan', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			res.render('user_dailyplan', {
				title: 'Napi terved',
				countries: CT,
				udata: req.session.user
			});
		}
	});

	app.post('/user_dailyplan', function (req, res) {
		if (req.session.user == null) {
			res.redirect('/');
		} else {
			/*AM.updateAccount({
				id: req.session.user._id,
				name: req.body['name'],
				email: req.body['email'],
				pass: req.body['pass'],
				country: req.body['country']
			}, function (e, o) {
				if (e) {
					res.status(400).send('error-updating-account');
				} else {
					req.session.user = o.value;
					res.status(200).send('ok');
				}
			});*/
		}
	});

	/*
		new accounts
	*/

	app.get('/signup', function (req, res) {
		res.render('signup', {
			title: 'Signup',
			countries: CT
		});
	});

	app.post('/signup', function (req, res) {
		AM.addNewAccount({
			name: req.body['name'],
			email: req.body['email'],
			user: req.body['user'],
			pass: req.body['pass'],
			country: req.body['country']
		}, function (e) {
			if (e) {
				res.status(400).send(e);
			} else {

				res.status(200).send('ok');
			}
		});
		console.log(req.body['name']);
	});

	/*
		password reset
	*/

	app.post('/lost-password', function (req, res) {
		let email = req.body['email'];
		AM.generatePasswordKey(email, req.ip, function (e, account) {
			if (e) {
				res.status(400).send(e);
			} else {
				EM.dispatchResetPasswordLink(account, function (e, m) {
					// TODO this callback takes a moment to return, add a loader to give user feedback //
					if (!e) {
						res.status(200).send('ok');
					} else {
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}
		});
	});

	app.get('/reset-password', function (req, res) {
		AM.validatePasswordKey(req.query['key'], req.ip, function (e, o) {
			if (e || o == null) {
				res.redirect('/');
			} else {
				req.session.passKey = req.query['key'];
				res.render('reset', {
					title: 'Reset Password'
				});
			}
		})
	});

	app.post('/reset-password', function (req, res) {
		let newPass = req.body['pass'];
		let passKey = req.session.passKey;
		// destory the session immediately after retrieving the stored passkey //
		req.session.destroy();
		AM.updatePassword(passKey, newPass, function (e, o) {
			if (o) {
				res.status(200).send('ok');
			} else {
				res.status(400).send('unable to update password');
			}
		})
	});

	/*
		view, delete & reset accounts
	*/

	app.get('/user_print', function (req, res) 
	{
		AM.getAllAccounts(function (e, accounts) 
		{
			res.render('user_print', {
				title: 'Account List',
				accts: accounts
			});
		})
	});

	app.post('/delete', function (req, res) 
	{
		AM.deleteAccount(req.session.user._id, function (e, obj) 
		{
			if (!e) 
			{
				res.clearCookie('login');
				req.session.destroy(function (e) 
				{
					res.status(200).send('ok');
				});
			} else 
			{
				res.status(400).send('record not found');
			}
		});
	});

	app.get('/reset', function (req, res) 
	{
		AM.deleteAllAccounts(function () {
			res.redirect('/print');
		});
	});

	app.get('*', function (req, res) 
	{
		res.render('404', {title: 'Page Not Found'});
	});

};