/*global $, common*/
'use strict';


$(document).ready(function () {
    
    // Initialize common components
    common.init();
    
    // Load gallery from server
    common.loadGallery('profile');
    
});