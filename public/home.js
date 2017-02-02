/*global $*/
/*global docCookies*/
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
}

$(document).ready(readyFunction);