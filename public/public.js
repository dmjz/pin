/*global $, common*/
'use strict';


$(document).ready(function () {
    
    // If no query id is supplied, return to home
    if (!common.queryId) { return window.location = common.appUrl; }
    
    // Initialize common components
    common.init();
    
    // Load gallery from server
    common.loadGallery('public');
    
});