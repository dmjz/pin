/*global $*/
/*global docCookies*/
var appUrl = 'https://' + window.location.hostname;
var loggedIn = docCookies.hasItem('username');
var cookieName;
if (loggedIn) { cookieName = docCookies.getItem('username'); }


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
		Build thumbnail gallery
	*/
	var galleryRow = $('#gallery-row');
	$.ajax({
		url: appUrl + '/user/allbooks',
		method: 'POST',
		data: '{}',
		contentType: 'application/json',
		success: function (data) { 
			if (data.error) { console.log('Error: ' + data.msg); }
			else { 
				var books = data.books;
				var book;
				var popTitle;
				var popContent;
				var popButton = loggedIn ? '<button type=\'button\' class=\'btn btn-success\'>Add to my collection</button>' : '';
				var bound = Math.min(books.length, 200);
				for (var i = 0; i < bound; i++) {
					book = books[i];
					popTitle = (
		                    '<p><em><span class=\'book-title\'>' + book.title + '</span></em>, '
		                +   '<span class=\'book-author\'>' + book.author + '</span></p>'
		                +	'<span class=\'book-cover\'>' + book.cover + '</span>'
		    		);
					popContent = popTitle + popButton;
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
				console.log('data returned: ');
				console.log(data);
			}
		}
	});
	
	
	/*
		Popover stuff
	*/
	function popoverClick (e) {
	    var parent = $(e.target).parent();
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
			}
		});
	}
	$('body').on('click', '.popover button', popoverClick);
}

$(document).ready(readyFunction);