/*global $*/
/*global docCookies*/
var appUrl = 'https://' + window.location.hostname;
var loggedIn = docCookies.hasItem('username');
var cookieName;
if (loggedIn) { window.location.href = '/'; }

/*
	Validate form inputs
*/
function validate (str, type) {
	var result = {};
	switch (type) {
		case 'user':
			result.isGood = false;
			if (str.length < 5) { 
				result.msg = 'Username must be at least 5 characters.';
				return result;
			}
			if (str.length > 20) {
				result.msg = 'Username can be at most 20 characters.';
				return result;
			}
			if (!RegExp(/^[A-Z0-9.\_]+$/, 'i').test(str)) {
				result.msg = 'Valid characters: letters, numbers, period, and underscore.';
				return result;
			}
			result.isGood = true;
			return result;
		break;
		case 'pass':
			result.isGood = false;
			if (str.length < 8) { 
				result.msg = 'Password must be at least 8 characters.';
				return result;
			}
			if (str.length > 20) {
				result.msg = 'Password can be at most 20 characters.';
				return result;
			}
			if (!RegExp(/^[A-Z0-9.\_]+$/, 'i').test(str)) {
				result.msg = 'Valid characters: letters, numbers, and these special characters: ! @ # $ % ^ & * . _';
				return result;
			}
			result.isGood = true;
			return result;
		break;
		case 'email':
			result.isGood = RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/, 'i').test(str);
			if (result.isGood) { return result; }
			result.msg = 'Invalid email address.';
			return result;
		break;
		default: 
			throw new Error('bad validation type');
		break;
	}
}

function readyFunction () {
	/*
        Navbar stuff
    */
    if (loggedIn) {
        $('.login-show').show();
        $('.login-hide').hide();
        $('#logout').on('click', function () {
            docCookies.removeItem('username');
            window.location.href = '/';
        });
    } else {
        $('.login-show').hide();
        $('.login-hide').show();
    }
    
	/*
		Set up form data and behavior
	*/
	var userInput = $('#user');
	var passInput = $('#pass');
	var loginButton = $('#login');
	var signupButton = $('#signup');
	loginButton.on('click', function () {
		var user = userInput.val();
		var pass = passInput.val();
		var userValidation = validate(user, 'user');
		var passValidation = validate(pass, 'pass');
		var allGood = userValidation.isGood && passValidation.isGood;
		if (!userValidation.isGood) {
			console.log('user invalid: ' + userValidation.msg);
		}
		if (!passValidation.isGood) {
			console.log('pass invalid: ' + passValidation.msg);
		}
		if (allGood) {
			(function (user) {
				$.ajax({
					url: appUrl + '/user/login',
					method: 'POST',
					data: JSON.stringify({ 
						username: userInput.val(),
						password: passInput.val()
					}),
					contentType: 'application/json',
					success: function (data) { 
						if (data.error) {
							console.log('Error: ' + data.msg);
						} else {
							console.log(data.msg);
							docCookies.setItem('username', user);
							window.location.href = '/';
						}
					}
				});
			})(user);
		}
	});
	signupButton.on('click', function () {
		window.location.href = '/signup';
	});
}

$(document).ready(readyFunction);