/*global $*/
/*global docCookies*/
var appUrl = 'https://' + window.location.hostname;
var loggedIn = docCookies.hasItem('username');
var cookieName;
if (loggedIn) { cookieName = docCookies.getItem('username'); }
else { window.location.href = '/login'; }


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
    	Trade state
    */
    var state = {
        myBook: null,
        otherBook: null,
        user: {
        	username: cookieName,
        	books: null
        },
        other: {
        	username: null,
        	books: null
        }
    };
    
    
    
	/*
		Build thumbnail galleries
	*/
	var galleryRow = $('#my-gallery-row');
	function fillUserGallery (books) {
		var book;
		var popTitle;
		var popContent;
		for (var i = 0; i < books.length; i++) {
			book = books[i];
			popTitle = (
	                '<p><span class=\'owner\'>me</span>'
	            +   '<em><span class=\'book-title\'>' + book.title + '</span></em>, '
	            +   '<span class=\'book-author\'>' + book.author + '</span></p>'
			);
			popContent = popTitle + '<button type=\'button\' class=\'btn btn-primary trade-add\'>Trade</button>';
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
			else { 
				state.user.books = data.books;
				fillUserGallery(data.books); 
			}
		}
	});
	
	
	var galleryRow2 = $('#other-gallery-row');
	var otherUserText = $('#other-user');
	function fillOtherGallery () {
		if (!state.other.username) { return console.log('fillOther called with null other'); }
    	otherUserText.html('<em>' + state.other.username + '</em>\'s books:');
    	galleryRow2.html('');
    	var book;
    	var popTitle;
    	var popContent;
    	for (var i = 0; i < state.other.books.length; i++) {
    		book = state.other.books[i];
    		popTitle = (
                    '<p><span class=\'owner\'>other</span>'
                +   '<em><span class=\'book-title\'>' + book.title + '</span></em>, '
                +   '<span class=\'book-author\'>' + book.author + '</span></p>'
    		);
    		popContent = popTitle + '<button type=\'button\' class=\'btn btn-primary trade-add\'>Trade</button>';
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
	function lookupBook (title, author, books) {
	    var book;
	    for (var i = 0; i < books.length; i++) {
	        book = books[i];
	        if (title === book.title && author === book.author) { return book; }
	    }
	    return null;
	}
	function popoverClick (e) {
	    var button = $(e.target);
	    if (button.hasClass('trade-add')) {
    	    var parent = button.parent();
    	    var book;
    	    var offerBox;
    	    var offerTitle;
    	    var offerContent;
    	    var owner = parent.find('.owner').html();
    	    if (owner === 'me') {
    		    console.log('add ' + parent.find('.book-title').html() + ' to my side of trade');
    		    book = lookupBook(
    		        parent.find('.book-title').html(), 
    		        parent.find('.book-author').html(), 
    		        state.user.books
    		    );
    		    state.myBook = book;
        		offerBox = $('#my-offer');
    	    } else {
    	        console.log('add ' + parent.find('.book-title').html() + ' to other side of trade');
    	        book = lookupBook(
    		        parent.find('.book-title').html(), 
    		        parent.find('.book-author').html(), 
    		        state.other.books
    		    );
    		    state.otherBook = book;
        		offerBox = $('#other-offer');
    	    }
    	    if (book === null) { 
		        alert('The desired book is missing from the collection.'); 
		        return; 
		    }
    	    offerTitle = (
    	            '<p><span class=\'owner\'>' + owner + '</span>'
    	        +   '<em>' + book.title + '</em>, ' + book.author + '</p>'
    	    );
        	offerContent = offerTitle + '<button type=\'button\' class=\'btn btn-warning trade-remove\'>Remove from trade</button>';
    	    offerBox.html(
    		        '<div class="thumbnail-box" data-toggle="popover" data-content="' + offerContent + '">'
    			+   '<a href="#" class="thumbnail">'
    			+	'<img src="' + book.cover + '" alt="book cover">'
    			+	'</a></div>'
    	    );
    	    $('[data-toggle="popover"]').popover({
        		html: true,
        		trigger: 'focus',
        		placement: 'top'
        	});
        	$('.thumbnail').on('click', function (e) { e.preventDefault(); });
	    } else if (button.hasClass('trade-remove')) {
	        if (button.parent().find('.owner').html() === 'me') {
	            console.log('remove my book from trade');
	            $('#my-offer').html('');
	            state.myBook = null;
	        } else {
	            console.log('remove other book from trade');
	            $('#other-offer').html('');
	            state.otherBook = null;
	        }
	    } else {
	        console.log('Unknown button type in popover!');
	        return;
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
	function searchCallback (data) {
		if (data.error) { return console.log('Error: ' + data.msg); }
    	if (data.length === 0) { return console.log('No results'); }
    	
    	var ul = $('.dropdown-menu');
    	ul.empty();
    	for (var i = 0; i < data.length; i++) {
    		if (data[i] === cookieName) { continue; }
    		ul.append(
    			'<li><a href="#">' +
    				'<span class="li-user">' + data[i] + '</span>' + 
    			'</a></li>'
    		);
    	}
    	ul.children().on('click', function () {
    		var username = $(this).find('.li-user').text();
    		$.ajax({
				url: appUrl + '/user/get',
				method: 'POST',
				data: JSON.stringify({ 
					username: username
				}),
				contentType: 'application/json',
				success: function (data) {
					if (data.error) { return console.log('Error: ' + data.msg); }
					state.other.username = data.username;
					state.other.books = data.books;
		    		$('.dropdown-menu').hide();
		    		fillOtherGallery();
				}
			});
    	});
    	$('.dropdown-menu').show();
    	$('.dropdown-toggle').dropdown('toggle');
    }
    $('#search-button').on('click', function (event) {
    	var text = $('#text').val();
    	if (text.length === 0) { return; }
    	$.ajax({
			url: appUrl + '/user/searchusers',
			method: 'POST',
			data: JSON.stringify({ 
				str: processString(text)
			}),
			contentType: 'application/json',
			success: searchCallback
		});
    });
    $('#text').on('click', function (event) {
    	event.stopPropagation();
    	$('.dropdown-menu').hide();
    });
	
	
	/*
	    Accept trade click
	*/
	function acceptClick () {
        if (state.myBook === null) {
            console.log('Error: my book not selected');
        }
        if (state.otherBook === null) {
            console.log('Error: other book not selected');
        }
        if (state.myBook !== null && state.otherBook !== null) {
            $.ajax({
				url: appUrl + '/user/addtrade',
				method: 'POST',
				data: JSON.stringify({ 
					user1: state.user.username,
					book1: state.myBook,
					user2: state.other.username,
					book2: state.otherBook,
					startUser: state.user.username
				}),
				contentType: 'application/json',
				success: function (data) {
					if (data.error) { console.log('Error: ' + data.msg); }
					else { 
						console.log(data.msg);
						$('#my-offer').empty();
						$('#other-offer').empty();
					}
				}
			});
        }
    }
	$('#accept').on('click', acceptClick);
}
$(document).ready(readyFunction);