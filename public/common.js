/*global $, URL*/
'use strict';


var appUrl = 'https://pin-djmot.herokuapp.com/';
var placeholderUrl = 'https://image.shutterstock.com/z/stock-vector-question-mark-sign-icon-vector-illustration-flat-design-style-283663211.jpg'
var imgSrc;
var globalMode;
var queryId;
(function getQueryId () {
    var url = window.location.href;
    var qstr;
    var qind = url.length - 1;
    while (url.charAt(qind) !== '?' && qind > -1) { qind--; }
    if (qind < 0 || qind === url.length - 1) { return; }
    qstr = url.slice(qind + 1);
    var queries = qstr.split('&');
    var query;
    for (var i = 0; i < queries.length; i++) {
        query = queries[i].split('=');
        if (query.length !== 2) { continue; }
        if (query[0] === 'user') { queryId = query[1]; break; }
    }
})();


var common = {
    appUrl: appUrl,
    queryId: queryId,
    
    init: function (mode) {
        // Upload form submission
        $('#image-form').on('submit', function (evt) {
            var input = $('#image-file').val();
            if (input === '') { console.log('empty input'); return false; }
            console.log('upload file');
            $(this).ajaxSubmit({dataType: 'json', success: function (data) {
                if (data) { 
                    if (data.message) { console.log(data.message); }
                    if (data.pin) { 
                        console.log('pin received: should append and reload layout now');
                        addItem(data.pin);
                    }
                }
            }});
            $('#image-file').val('');
            $('#image-target').empty();
            $('#upload-modal').modal('hide');
            return false;
        });
        
        // Input image preview
        $('#image-file').on('change', function (evt) {
            var input = evt.target;
            $('#image-target').empty();
            if (input.files && input.files[0]) {
                if (imgSrc) { URL.revokeObjectURL(imgSrc); }
                imgSrc = URL.createObjectURL(input.files[0]);
                var img = $('<img>', { 
                    class: 'input-image', 
                    src: imgSrc,
                    alt: input.files[0]
                });
                $('#image-target').append(img);
            }
        });
    },
    
    
    loadGallery: function (mode) {
        globalMode = mode;
        
        var ajaxUrl;
        switch (mode) {
            case 'home':
                ajaxUrl = appUrl + 'pin/all';
                break;
            case 'profile':
                ajaxUrl = appUrl + 'user/pins';
                break;
            case 'public':
                ajaxUrl = appUrl + 'pin/user?user=' + queryId;
                break;
            default: 
                return console.log('Bad mode parameter in loadGallery');
        }
        
        $.ajax({
            url: ajaxUrl,
            method: 'GET',
            success: function (data) {
                if (data.message) { console.log(data.message); }
                if (data.pins) { buildGallery(data.pins, mode); }
            }
        });
    }
};


function makeItem (datum, mode, ind) {
    switch (mode) {
        case 'home':
        case 'public':
            return (
                '<div class="grid-item"><div class="grid-item-inner">' + 
                    '<img src="' + datum.url + '" alt="upload-' + ind +'" class="pin-img">' +
                    '<div class="pin-row">' +  
                        '<div class="owner-box"><span class="owner no-show">' + datum.owner + '</span>' +
                        '<span class="name">' + datum.name + '</span></div>' + 
                    '<div class="like-box"><a class="like-button">&#10084</a>' +
                        '<span class="likes">' + datum.likes + '</span>' +
                        '<span class="id no-show">' + datum._id + '</span>' + 
                    '</div></div>' + 
                '</div></div>'
            );
        case 'profile':
            return (
                '<div class="grid-item"><div class="grid-item-inner">' + 
                    '<img src="' + datum.url + '" alt="upload-' + ind +'" class="pin-img">' + 
                    '<div class="pin-row">' + 
                        '<div class="owner-box"><i data-toggle="popover" data-trigger="focus" tabindex="0" data-content="' + 
                            '<p class=\'pop-p\'>Are you sure you want to delete this pin?</p>' +
                            '<span class=\'id no-show\'>' + datum._id + '</span>' +
                            '<button type=\'button\' class=\'btn btn-danger\'>Delete</button>' + 
                        '" class="fa fa-trash delete-button has-pop"></i></div>' + 
                        '<div class="like-box"><a class="like-button">&#10084</a>' + 
                        '<span class="likes">' + datum.likes + '</span>' +
                        '<span class="id no-show">' + datum._id + '</span>' + 
                    '</div></div>' + 
                '</div></div>'
            );
        default:
            return console.log('Bad mode parameter in makeItem');
    }
}
function attachBehaviors (mode) {
    switch (mode) {
        case 'home':
        case 'public':
            $('.owner-box').on('click', function (evt) {
                window.location = appUrl + 'public?user=' + $(this).find('.owner').html(); 
            });
            break;
        case 'profile':
            $('.has-pop').popover({
                html: true 
            }).parent().on('click', 'button', function (evt) {
                var id = $(this).parent().find('.id').html();
                console.log('Clicked to delete ' + id);
                (function (id) {
                    $.ajax({
                        url: appUrl + 'pin/delete?id=' + id,
                        method: 'GET',
                        success: function (data) {
                            if (data.message) { console.log(data.message); }
                            if (data.op) { 
                                console.log('Should remove pin from masonry layout.');
                                removeItem(id);
                            }
                        }
                    });
                })(id);
            });
            break;
        default:
            return console.log('Bad mode parameter in attachBehaviors');
    }
    $('.grid').imagesLoaded(function () {
        $('.grid').masonry({
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            percentPosition: true
        });
    });
    $('img').on('error', function (evt) {
        console.log('broken image detected');
        $(this).off();
        $(this).attr('src', placeholderUrl);
        return true;
    });
    $('.pin-img').on('click', function (evt) {
        window.open($(this).attr('src'));
    });
    $('.like-button').on('click', function (evt) {
        var button = $(this);
        var likes = button.siblings('.likes');
        if (!button.hasClass('liked')) {
            $.ajax({
                url: appUrl + 'pin/like',
                method: 'POST',
                data: JSON.stringify({ id: button.siblings('.id').html() }),
                contentType: 'application/json',
                success: function (data) {
                    if (data.message) { console.log(data.message); }
                }
            });
            button.addClass('liked');
            likes.html( (parseInt(likes.html()) + 1) );
        } else {
            $.ajax({
                url: appUrl + 'pin/unlike',
                method: 'POST',
                data: JSON.stringify({ id: button.siblings('.id').html() }),
                contentType: 'application/json',
                success: function (data) {
                    if (data.message) { console.log(data.message); }
                }
            });
            button.removeClass('liked');
            likes.html( (parseInt(likes.html()) - 1) );
        }
    });
}
function buildGallery (data, mode) {
    var wall = $('#wall');
    wall.empty();
    wall.append('<div class="grid-sizer"></div>');
    
    var ub = Math.min(data.length, 50);
    for (var i = 0; i < ub; i++) { wall.append(makeItem(data[i], mode, i)); }
    attachBehaviors(mode);
}


function addItem (datum) {
    var wall = $('#wall');
    wall.append(makeItem(datum, globalMode, $('.grid-item').length));
    attachBehaviors(globalMode);
    wall.masonry('reloadItems');
    wall.masonry('layout');
}


function removeItem (id) {
    $('.like-box .id').each(function (i, span) {
        var spanJ = $(span);
        if (spanJ.html() === id) {
            spanJ.closest('.grid-item').remove();
            $('#wall').masonry('reloadItems');
            $('#wall').masonry('layout');
            return;
        }
    });
}
