/*
Template Name: Chatvia - Responsive Bootstrap 4 Chat App
Author: Themesbrand
Version: 2.1.0
Website: https://themesbrand.com/
Contact: themesbrand@gmail.com
File: Index init js
*/

$(document).ready(function() {
    $('.popup-img').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'mfp-img-mobile',
        image: {
            verticalFit: true
        }
    });

    // user-status carousel

    $('#user-status-carousel').owlCarousel({
        items: 4,
        loop:false,
        margin:16,
        nav: false,
        dots: false,
    });

    // chat input more link carousel
    $('#chatinputmorelink-carousel').owlCarousel({
        items: 2,
        loop: false,
        margin:16,
        nav: false,
        dots: false,
        responsive:{
            0:{
                items:2,
            },
            600:{
                items:5,
                nav:false
            },
            992:{
                items:8,
            }
        }
    });

    // filter hide/show

    $("#user-profile-hide").click(function(){
        $(".user-profile-sidebar").hide();
    });
    $(".user-profile-show").click(function(){
        $(".user-profile-sidebar").show();
    });

    // chat user responsive hide show
    $(".chat-user-list li a").click(function(){
        $(".user-chat").addClass("user-chat-show");
    });

    $(".user-chat-remove").click(function(){
        $(".user-chat").removeClass("user-chat-show");
    });
});