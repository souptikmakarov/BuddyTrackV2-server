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
    $('.menu2').click(function(){
        $('.hidden-right').removeClass('not').addClass('yes');
        $('.right-overlay').removeClass('hide').addClass('see');
    });
    $('.right-overlay').click(function(){
        $('.hidden-right').removeClass('yes').addClass('not');
        $('.right-overlay').removeClass('see').addClass('hide');
    });
    $('body').on('swiperight', function(event) {
        if ( event.swipestart.coords[0] <50) {
            if($('.hidden-nav').hasClass('inactive') && $('.hidden-right').hasClass('not')) {
                $('.hidden-nav').removeClass('inactive').addClass('active');
                $('.overlay').removeClass('hidden').addClass('show');
            }
        }
        if($('.hidden-right').hasClass('yes')) {
            $('.hidden-right').removeClass('yes').addClass('not');
            $('.right-overlay').removeClass('see').addClass('hide');
        }
    });
    $('body').on('swipeleft', function(event) {
        if ( event.swipestart.coords[0] > ($(window).width()-50)) {
            if($('.hidden-right').hasClass('not') && $('.hidden-nav').hasClass('inactive')) {
                $('.hidden-right').removeClass('not').addClass('yes');
                $('.right-overlay').removeClass('hide').addClass('see');
            }
        }
        if ( $('.hidden-nav').hasClass('active')){
            $('.hidden-nav').removeClass('active').addClass('inactive');
            $('.overlay').removeClass('show').addClass('hidden');
        }
    });
});