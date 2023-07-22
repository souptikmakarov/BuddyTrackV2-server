$(document).ready(function(){
	$('#exit').hide();
    $('.has-nav-sub-menu').click(function(e){
        if (e.target.className=="has-nav-sub-menu") {
            var subNo=$(this).attr('opens-sub');
            $('[sub-no="'+subNo+'"]').toggleClass('nav-sub-menu-visible');
        }
    });
    $('.has-nav-sub-sub-menu').click(function(){
        var subNo=$(this).attr('opens-sub');
        $('[sub-sub-no="'+subNo+'"]').toggleClass('nav-sub-sub-menu-visible');
    });
    $('.menu').click(function(){
        $('.hidden-nav').removeClass('inactive').addClass('active');
        $('.overlay').removeClass('hidden').addClass('show');
    });
    $('.overlay').click(function(){
        $('.hidden-nav').removeClass('active').addClass('inactive');
        $('.overlay').removeClass('show').addClass('hidden');
    });
    $('#exit').on('click', function() {
        var socket = io.connect('http://buddytrack.herokuapp.com', {'sync disconnect on unload': false });

        socket.on('connect', function(){
            var lname = localStorage.getItem("uid");
            socket.emit('exit',lname);
        });
    });
    $('body').on('swiperight', function(event) {
        if ( event.swipestart.coords[0] <50 && $('.hidden-nav').hasClass('inactive')) {
            $('.hidden-nav').removeClass('inactive').addClass('active');
            $('.overlay').removeClass('hidden').addClass('show');
        }
    });
    $('body').on('swipeleft', function(event) {
        if ( $('.hidden-nav').hasClass('active')){
            $('.hidden-nav').removeClass('active').addClass('inactive');
            $('.overlay').removeClass('show').addClass('hidden');
        }
    });
});