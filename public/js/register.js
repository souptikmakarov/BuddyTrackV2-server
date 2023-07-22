$(document).on('ready', function() {
	var url = document.location.href;
    url = url.split('=');
    var id = url[1];
    if(id!=undefined) {
        localStorage.setItem("uid",id);
    }
	$('#loader').attr({class: 'my-invisible'});
	$('#regForm').on('submit', function(e) {
		register(e);
	});
	$('#register').on('click', function(e) {
		register(e);
	});
	$('#change').on('click', function() {
	    window.location.href="/signin";
	});
	function register(e){
		e.preventDefault();
		if($('#username').val()==""){
			alert("Enter username");
		}else if($('#pwd').val()==""){
			alert("Enter password");
		}else{
			var user = $('#username').val().trim();
			var pass = $('#pwd').val().trim();
			$('#loader').attr({class: 'my-visible'});
			$.ajax({
				url: '/register',
				type: 'POST',
				data: {
					username: user,
					password: pass
				},
				success: function(result){
					$('#loader').attr({class: 'my-invisible'});
					var reply=result;
					if (reply=="username_taken") {
						$('#loader').attr({class: 'my-invisible'});
						alert("The username entered is already taken.");
					}else if(reply=="registration_complete"){
						alert("Registration complete");
						location.href="/signin";
					}
				},
				error: function(result){
					$('#loader').attr({class: 'my-invisible'});
					alert("Error.");
				}
			});
		}
	}
});