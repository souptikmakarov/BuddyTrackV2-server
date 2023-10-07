$(document).on('ready', function() {
	var url = document.location.href;
    url = url.split('=');
    var id = url[1];
    if(id!=undefined) {
        localStorage.setItem("uid",id);
    }
	$('#loader').attr({class: 'my-invisible'});
	if(localStorage.getItem("username")!=null) {
		location.href = "/chat";
	} else {
		$('#regForm').on('submit', function(e) {
			check(e);
		});
		$('#submitBtn').on('click', function(e) {
			check(e);
		});
		$('#change').on('click', function() {
		    window.location.href="/signup";
		});
	}
	function check(e){
		e.preventDefault();
		if($('#username').val()==""){
			alert("Enter username");
		}else if($('#pwd').val()==""){
			alert("Enter password");
		}else{
			var user = $('#username').val().trim();
			var pass = $('#pwd').val().trim();
			$('#loader').attr({class: 'my-visible'});
			localStorage.removeItem("username");
			localStorage.setItem("username",user);
			location.href = "/chat";
			// $.ajax({
			// 	url: '/login',
			// 	type: 'POST',
			// 	data: {
			// 		username: user,
			// 		password: pass
			// 	},
			// 	success: function(result){
			// 		var reply=result;
			// 		if (reply=="incorrect_username") {
			// 			$('#loader').attr({class: 'my-invisible'});
			// 			alert("The username entered does not exist.");
			// 		}else if(reply=="incorrect_password"){
			// 			$('#loader').attr({class: 'my-invisible'});
			// 			alert("Incorrect password");
			// 		}else if(reply=="login_success"){
			// 			localStorage.removeItem("username");
			// 			localStorage.setItem("username",user);
			// 			location.href = "/chat";
			// 		}
			// 	},
			// 	error: function(result){
			// 		$('#loader').attr({class: 'my-invisible'});
			// 		alert("Error "+result);
			// 	}
			// });
		}
	}
});