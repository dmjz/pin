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
		case 'title':
		case 'author':
			result.isGood = false;
			if (str.length > 40) {
				result.msg = 'Input can be at most 40 characters.';
				return result;
			}
			if (!RegExp(/^[A-Z0-9.\-:' ]+$/, 'i').test(str)) {
				result.msg = 'Valid characters: letters, numbers, spaces, and these special characters: . - :';
				return result;
			}
			result.isGood = true;
			return result;
		break;
		case 'cover':
			result.isGood = RegExp(/[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=%]+\.(jpg|png|gif)$/).test(str);
			if (result.isGood) { return result; }
			result.msg = 'Cover must be the URL of a file with extension .jpg, .png, or .gif.';
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
		Build user gallery
	*/
	var galleryRow = $('#my-gallery-row');
	// results = array of books
	function fillUserGallery (results) {
		var book;
		var popTitle;
		var popContent;
		galleryRow.empty();
		for (var i = 0; i < results.length; i++) {
			book = results[i];
			popTitle = (
					'<p><em><span class=\'book-title\'>' + book.title + '</span></em>, '
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
	$.ajax({
		url: appUrl + '/user/get',
		method: 'POST',
		data: JSON.stringify({ 
			username: cookieName
		}),
		contentType: 'application/json',
		success: function (data) { 
			if (data.error) { console.log('Error: ' + data.msg); }
			else { fillUserGallery(data.books); }
		}
	});
	
	
	/*
		Build search gallery
	*/
	var galleryRow2 = $('#search-gallery-row');
	// results = array of books
	function fillSearchGallery (results) {
		var book;
		var popTitle;
		var popContent;
    	galleryRow2.empty();
    	for (var i = 0; i < results.length; i++) {
    		book = results[i];
    		popTitle = (
                    '<p><em><span class=\'book-title\'>' + book.title + '</span></em>, '
                +   '<span class=\'book-author\'>' + book.author + '</span></p>'
                +	'<span class=\'book-cover\'>' + book.cover + '</span>'
    		);
    		popContent = popTitle + '<button type=\'button\' class=\'btn btn-success search\'>Add</button>';
    		galleryRow2.append(
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
	    if (button.hasClass('search')) {
	    	$.ajax({
				url: appUrl + '/user/addbook',
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
					else { fillUserGallery(data.books); }
				}
			});
	    } else if (button.hasClass('remove')) {
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
	    Search stuff
	*/
	function processString (str) {
	    var specialChars = '[\\^$.|?*+()'.split('');
	    var processed = '';
	    var char;
	    var max = Math.min(20, str.length);
	    for (var i = 0; i < max; i++) {
	        char = str.charAt(i);
	        if (specialChars.indexOf(char) < 0) { processed += char; }
	        else { processed += '\\' + char; }
	    }
	    return processed;
	}
    $('#search-button').on('click', function () {
    	var text = $('#text').val();
    	if (text.length === 0) { return; }
    	$.ajax({
			url: appUrl + '/user/searchbooks',
			method: 'POST',
			data: JSON.stringify({ 
				str: processString(text)
			}),
			contentType: 'application/json',
			success: function (data) { 
				if (data.error) { console.log('Error: ' + data.msg); } 
				else if (data.length === 0) { console.log('No search results'); } 
				else { fillSearchGallery(data); }
			}
		});
    });
    
    
    /*
    	Add new book
    */
    var titleInput = $('#title');
    var authorInput = $('#author');
    var coverInput = $('#cover');
    function addClick () {
    	var title = titleInput.val();
    	var author = authorInput.val();
    	var cover = coverInput.val();
    	var titleValidation = validate(title, 'title');
		var authorValidation = validate(author, 'author');
		var coverValidation = validate(cover, 'cover');
		var allGood = titleValidation.isGood && authorValidation.isGood && coverValidation.isGood;
		if (!titleValidation.isGood) {
			console.log('title invalid: ' + titleValidation.msg);
		}
		if (!authorValidation.isGood) {
			console.log('author invalid: ' + authorValidation.msg);
		}
		if (!coverValidation.isGood) {
			console.log('cover invalid: ' + coverValidation.msg);
		}
		if (allGood) {
			$.ajax({
				url: appUrl + '/user/newbook',
				method: 'POST',
				data: JSON.stringify({ 
					username: cookieName,
					title: title,
					author: author,
					cover: cover
				}),
				contentType: 'application/json',
				success: function (data) { 
					if (data.error) { console.log('Error: ' + data.msg); } 
					else { 
						console.log(data.msg);
						fillUserGallery(data.books); 
						titleInput.val('');
						authorInput.val('');
						coverInput.val('');
					}
				}
			});
		}
    }
    $('#add').on('click', addClick);
}
$(document).ready(readyFunction);