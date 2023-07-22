$(window).load(function() {
	var avail = {}, grp = {}, cnt=0, ret_cnt=0, flag=0, fin_grp = {}, gotPlace = false, placeChecker;
	var my_username = localStorage.getItem("username");
	socket = io.connect('https://buddytrack2.herokuapp.com', {'sync disconnect on unload': false });

	socket.on('connect', function() {
		socket.emit('update_user',my_username);
		socket.emit('get_user',my_username);
	});

	socket.on('user_det', function(available) {
		avail = available;
		for(var usr in available) {
			if(usr != my_username)
				$(".left").append('<div class="user"><div class="usedet">' + usr + '</div></div>');
		}
	});

	socket.on('user_det_update', function(name){
		// console.log(name);
	});

	$('.select').on('click', function() {
		var temp = $('.uname').val();
		var flag = false;
		for (var usr in avail) {
			if(temp == usr) {
				flag = true;
				break;
			}
		}
		// console.log(flag + ' ' + temp);
		if(flag == true) {
			$(".show").append('<div class="user"><div class="usedet">' + temp + '</div></div>');
			grp[cnt] = temp;
			cnt = parseInt(cnt)+1;
		}
	});

	$('.send').on('click', function() {
		socket.emit('send_grp_req',my_username,grp,cnt);
	});

	socket.on('pending_grp_req', function() {
		$('.show').html("<font color='red'>Request Pending.</font>");
	});

	socket.on('reply_grp_access', function(msg,name) {
		if(msg == "yes"){
			$('.show').html("");
			$('.show').append('<div class="user"><div class="usedet">' + name + '</div></div>');
			alert(name+" has accepted your request.");
			fin_grp[ret_cnt] = name;
			ret_cnt = ret_cnt + 1;
			flag = flag + 1;
		}else{
			alert(name+" has rejeced your request.");
			flag = flag + 1;
		}
		if(flag == cnt) {
			if (gotPlace) {
				socket.emit('start_grp_act',my_username);
			}else{
				alert('Enter central meeting place');
				placeChecker = setInterval(checkPlace,10000);
			}
			
		}
	});

	function checkPlace(){
		if (gotPlace) {
			clearInterval(placeChecker);
			socket.emit('start_grp_act',my_username);
		}else{
			alert('Enter central meeting place');
		}
	}

	socket.on('starting_grp_act', function() {
		uri = "/groupchat?+master+";
		for(var i = 0;i < ret_cnt;i++) {
			uri = uri+fin_grp[i];
			if(i != cnt-1) {
				uri = uri+"+";
			}
		} 
		location.href = uri;
	});



	$('#autocomplete').on('click', function() {
		var input = document.getElementById('autocomplete');

        var autocomplete = new google.maps.places.Autocomplete(input);

        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                alert('Please try again');
            }
            localStorage.setItem("place_lat",place.geometry.location.lat());
            localStorage.setItem("place_lng",place.geometry.location.lng());
            gotPlace = true;
        });
	});

	window.addEventListener("beforeunload", function (e) {
		socket.emit('return_group_client',my_username);
		(e || window.event).returnValue = null;
		return null;
	});
});