/*global $*/
/*global docCookies*/
var appUrl = 'https://' + window.location.hostname;
var loggedIn = docCookies.hasItem('username');
var cookieName;
if (loggedIn) { cookieName = docCookies.getItem('username'); }
else { window.location.href = '/login'; }

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
		case 'city':
		case 'state':
		case 'name':
			result.isGood = false;
			if (str.length > 40) {
				result.msg = 'City/state/name can be at most 40 characters.';
				return result;
			}
			if (!RegExp(/^[A-Z0-9.\-' ]+$/, 'i').test(str)) {
				result.msg = 'Valid characters: letters, numbers, spaces, and these special characters: . - ';
				return result;
			}
			result.isGood = true;
			return result;
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
		Get user info
	*/
	var tradeRequests;
	var books;
	$.ajax({
		url: appUrl + '/user/get',
		method: 'POST',
		data: JSON.stringify({ 
			username: cookieName
		}),
		contentType: 'application/json',
		success: function (data) { 
			if (data.error) {
				console.log('Error: ' + data.msg);
			} else {
				$('#name').val(data.name);
				$('#email').val(data.email);
				$('#city').val(data.city);
				$('#state').val(data.state);
				books = data.books;
				fillUserGallery();
				tradeRequests = data.tradeRequests;
				fillTradeRequests(data.tradeRequests);
			}
		}
	});
    
    
    /*
		Build user gallery
	*/
	var galleryRow = $('#gallery-row');
	function fillUserGallery () {
		var book;
		var popTitle;
		var popContent;
		galleryRow.empty();
		for (var i = 0; i < books.length; i++) {
			book = books[i];
			popTitle = (
	            	'<em><span class=\'book-title\'>' + book.title + '</span></em>, '
	            +   '<span class=\'book-author\'>' + book.author + '</span></p>'
	            +	'<span class=\'book-cover\'>' + book.cover + '</span>'
			);
			popContent = popTitle + '<button type=\'button\' class=\'btn btn-warning remove\'>Remove from my collection</button>';
			galleryRow.append(
					'<div class="thumbnail-box" data-toggle="popover" data-content="' + popContent + '">'
				+   '<a href="#" class="thumbnail">'
				+	'<img src="' + book.cover + '" alt="book cover">'
				+	'</a></div>'
			);
		}
		$('[data-toggle="popover"]').popover({
	    		html: true,
	    		trigger: 'focus',
	    		placement: 'top'
	    });
	    $('.thumbnail').on('click', function (e) { e.preventDefault(); });
	}
	
	
	/*
	    Popover stuff
	*/
	function popoverClick (e) {
	    var button = $(e.target);
	    var parent = button.parent();
	    if (button.hasClass('remove')) {
    		$.ajax({
				url: appUrl + '/user/removebook',
				method: 'POST',
				data: JSON.stringify({ 
					username: cookieName,
					title: parent.find('.book-title').html(),
					author: parent.find('.book-author').html(),
					cover: parent.find('.book-cover').html()
				}),
				contentType: 'application/json',
				success: function (data) { 
					if (data.error) { console.log('Error: ' + data.msg); }
					else { console.log(data.msg); fillUserGallery(data.books); }
				}
			});
	    } else {
	        console.log('Unknown button type in popover!');
	    }
	}
	$('body').on('click', '.popover button', popoverClick);
	$('.thumbnail').on('click', function (e) { e.preventDefault(); });
    
	
	/*
		Populate trade requests
	*/
	var outTrades = $('#out-trades');
	var inTrades = $('#in-trades');
	function fillTradeRequests(trades) {
		outTrades.empty();
		inTrades.empty();
		var request;
		var requestText;
		for (var i = 0; i < trades.out.length; i++) {
			request = trades.out[i];
			if (cookieName === request.user1) {
				requestText = '<p>You offered "' + request.book1.title + '" for <em>' + request.user2 + '</em>\'s "' + request.book2.title + '".</p>';
			} else {
				requestText = '<p>You offered "' + request.book2.title + '" for <em>' + request.user1 + '</em>\'s "' + request.book1.title + '".</p>';
			}
			outTrades.append(
					'<div class="row out-trade-row">'
				+	'<div class="trade-box">' + requestText
				+	'<span class="trade-type">out</span><span class="trade-index">' + i + '</span>'
				+	'<button type="button" class="btn btn-default cancel">Cancel request</button>'
				+	'</div></div>'
			);
		}
		for (var i = 0; i < trades.in.length; i++) {
			request = trades.in[i];
			if (cookieName === request.user1) {
				requestText = '<p><em>' + request.user2 + '</em> offered "' + request.book2.title + '" for "' + request.book1.title + '".</p>';
			} else {
				requestText = '<p><em>' + request.user1 + '</em> offered "' + request.book1.title + '" for "' + request.book2.title + '".</p>';
			}
			inTrades.append(
					'<div class="row in-trade-row">'
				+	'<div class="trade-box">' + requestText
				+	'<span class="trade-type">in</span><span class="trade-index">' + i + '</span>'
				+	'<button type="button" class="btn btn-success accept">Accept</button>'
				+	'<button type="button" class="btn btn-danger decline">Decline</button>'
				+	'</div></div>'
			);
		}
		$('.trade-box button').on('click', function (e) {
			var button = $(e.target);
			var ind = parseInt(button.siblings('.trade-index').html());
			if (button.hasClass('cancel')) {
				(function (i) {
					$.ajax({
						url: appUrl + '/user/removetrade',
						method: 'POST',
						data: JSON.stringify(tradeRequests.out[i]),
						contentType: 'application/json',
						success: function (data) { 
							if (data.error) { console.log('Error: ' + data.msg); }
							else { console.log(data.msg); }
							tradeRequests.out.splice(i, 1);
							fillTradeRequests(tradeRequests);
						}
					});
				})(ind);
			} else if (button.hasClass('accept')) {
				(function (i) {
					var data = tradeRequests.in[i];
					data.caller = cookieName;
					$.ajax({
						url: appUrl + '/user/processtrade',
						method: 'POST',
						data: JSON.stringify(data),
						contentType: 'application/json',
						success: function (data) { 
							if (data.error) { console.log('Error: ' + data.msg); }
							else { 
								console.log(data.msg); 
								books = data.books;
								fillUserGallery();
							}
							tradeRequests.in.splice(i, 1);
							fillTradeRequests(tradeRequests);
						}
					});
				})(ind);
			} else if (button.hasClass('decline')) {
				(function (i) {
					$.ajax({
						url: appUrl + '/user/removetrade',
						method: 'POST',
						data: JSON.stringify(tradeRequests.in[i]),
						contentType: 'application/json',
						success: function (data) { 
							if (data.error) { console.log('Error: ' + data.msg); }
							else { console.log(data.msg); }
							tradeRequests.in.splice(i, 1);
							fillTradeRequests(tradeRequests);
						}
					});
				})(ind);
			} else {
				console.log('Unkown button type in trade-box!');
			}
		});
	}
	
	
	/*
		Set up form data and behavior
	*/
	var nameInput = $('#name');
	var emailInput = $('#email');
	var cityInput = $('#city');
	var stateInput = $('#state');
	var editButton = $('#edit');
	var saveButton = $('#save');
	editButton.on('click', function () {
		nameInput.removeAttr('readonly');
		emailInput.removeAttr('readonly');
		cityInput.removeAttr('readonly');
		stateInput.removeAttr('readonly');
		editButton.addClass('hidden');
		saveButton.removeClass('hidden');
	});
	saveButton.on('click', function () {
		var name = nameInput.val();
		var email = emailInput.val();
		var city = cityInput.val();
		var state = stateInput.val();
		var nameValidation = validate(name, 'name');
		var cityValidation = validate(city, 'city');
		var emailValidation = validate(email, 'email');
		var stateValidation = validate(state, 'state');
		var allGood = nameValidation.isGood && cityValidation.isGood && emailValidation.isGood && stateValidation.isGood;
		if (!nameValidation.isGood) {
			console.log('name invalid: ' + nameValidation.msg);
		}
		if (!cityValidation.isGood) {
			console.log('city invalid: ' + cityValidation.msg);
		}
		if (!stateValidation.isGood) {
			console.log('state invalid: ' + stateValidation.msg);
		}
		if (!emailValidation.isGood) {
			console.log('email invalid: ' + emailValidation.msg);
		}
		if (allGood) {
			nameInput.attr('readonly', 'true');
			emailInput.attr('readonly', 'true');
			cityInput.attr('readonly', 'true');
			stateInput.attr('readonly', 'true');
			editButton.removeClass('hidden');
			saveButton.addClass('hidden');
			$.ajax({
				url: appUrl + '/user/update',
				method: 'POST',
				data: JSON.stringify({ 
					username: cookieName,
					name: name,
					email: email,
					city: city,
					state: state
				}),
				contentType: 'application/json',
				success: function (data) { 
					if (data.error) {
						console.log('Error: ' + data.msg);
					} else {
						console.log(data.msg);
					}
				}
			});
		}
	});
}

$(document).ready(readyFunction);