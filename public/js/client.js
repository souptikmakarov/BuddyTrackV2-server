$(window).load(function() {

	var directionsDisplay = new google.maps.DirectionsRenderer({
	  polylineOptions: {
	    strokeColor: "red"
	  }
	});

	var directionsService = new google.maps.DirectionsService();

	var freq_send = null,googleMap = null,avail={},first = true,my_pos={},watchID=null;

	var fin_grp = {},cnt=0;

	var my_username = '',recv_username='',geodetails='',socket = null;

	if(localStorage.getItem("username") != null){
		socket = io.connect('http://localhost:5000', {'sync disconnect on unload': false });
	}else{
		alert("Please Login Again.");
		location.href="/signin";
	}

	// on connection to server
	socket.on('connect', function(){
		get_loc();
		my_username = localStorage.getItem("username");
		setTimeout(send_username, 1000);
	});

	$('input[type="submit"]').prop("disabled",true);

	$('#add_recv').on('click', function(event) {
		get_receiver_username();
	});

	//Takes input username and sends it to server to check whether valid or not
	function send_username(){
		socket.emit('user_entry',my_username);
	}

	//Server sends acknowledgement whether username is valid or not
	socket.on('user_entry_ack',function(msg,available){
		$("#loader").fadeOut("slow");
		avail=available;
		if (msg=="yes") {
			$('.hidden-right').removeClass('not').addClass('yes');
			$('.right-overlay').removeClass('hide').addClass('see');
			$('#available').show();
			$('#add_recv').show();
			$('#usrdet').text(my_username+' is online.');
		}else{
			socket.emit('delete_user',my_username);
		}
		$('#available').html("<li>Available Users:</li>");
		for(var usr in available) {
			if(available[usr]==true)
				$('#available').append("<li>"+usr+"</li>");
		}
	});


	//Sends username of reciever to server to check whether reciever is available or not
	function get_receiver_username(){
		var chk_flag = false;
		recv_username=prompt("Enter reciever's username");
		recv_username=recv_username.trim();
		if(recv_username!=null && recv_username.length!=0) {
			for(var usr in avail) {
				if(avail[usr]==true) {
					if (usr == recv_username) {
						chk_flag = true;
						break;
					}
				}
			}
			if (recv_username==my_username || chk_flag == false){
				get_receiver_username();
			}
			else
				socket.emit('recv_name',recv_username);
		}else{
			alert('Enter Valid Username.');
		}
	}

	//Server sends availibility of reciever
	socket.on('recv_name_ack',function(msg,available){
		avail=available;
		if (msg=="yes") {
			$('input[type="submit"]').prop("disabled",false);
			$('#add_recv').hide();
			$('#welcome').text('No Messages.');
			$('#available').hide();
			$('#usrdet').text(my_username+' -> '+recv_username);
			$('#sendgeo').removeClass('my-invisible');
			$('#receivegeo').removeClass('my-invisible');
			$('#stop').removeClass('my-invisible');
		}else{
			alert("Reciever is not available. Please try a different username.");
			recv_username='';
		}
		$('#available').html("<li>Available Users:</li>");
		for(var usr in available) {
			if(available[usr]==true)
				$('#available').append("<li>"+usr+"</li>");
		}
	});

	socket.on('user_update', function(available) {
		avail=available;
		$('#available').html("<li>Available Users:</li>");
		for(var usr in available) {
			if(available[usr]==true)
				$('#available').append("<li>"+usr+"</li>");
		}
	});

	socket.on('allow_access',function(name){
		var reply=confirm(name+" wants to start a conversation with you\nPress OK to allow and Cancel to deny");
		if(reply==true){
			socket.emit('allow_access_reply','yes',name);
			$('#add_recv').hide();
			$('#available').hide();
			$('#usrdet').text(my_username+' -> '+name);
			$('#sendgeo').removeClass('my-invisible');
			$('#receivegeo').removeClass('my-invisible');
			$('#stop').removeClass('my-invisible');
			recv_username=name;
			$('input[type="submit"]').prop("disabled",false);
		}else{
			socket.emit('allow_access_reply','no',name);
		}
	});

	socket.on('pending_request',function(name){
		$('#add_recv').hide();
		$('#welcome').text('Pending confirmation.');
	});

	socket.on('recv_req_reject',function(name,available){
		avail=available;
		alert(name+" has rejected your request to connect. Please try again");
		$('#add_recv').show();
		$('#welcome').text('No Messages.');
		$('#available').html("<li>Available Users:</li>");
		for(var usr in available) {
			if(available[usr]==true)
				$('#available').append("<li>"+usr+"</li>");
		}
	});


	$('form').submit(function (e){
		e.preventDefault();
		var message = $('#m').val();
		if(message == '' || jQuery.trim(message).length == 0)
		return false;
		$('#m').val('');
		$('#messages').append($('<li class="sent-msg">').text(my_username+": "+message));
		console.log("Sending: "+recv_username+" "+my_username+" "+message);
		socket.emit('chat_message',recv_username,message);
	});

	$('#exit').on('click', function() {
        var lname = localStorage.getItem("uid");
        socket.emit('exit',lname);
	});

	$('#sendgeo').on('click', function() {
		geodetails = {'Lat':my_pos.Lat,'Long':my_pos.Long,'onetime':'yes'};
		socket.emit('send_loc',recv_username,geodetails);
	});

	$('#stop').on('click', function() {
		$('#receivegeo').show();
		socket.emit('stop_req',recv_username);
	});

	function send_loc() {
		if(jQuery.isEmptyObject(my_pos)) {
			socket.emit('chat_message_loc',recv_username,'Sorry try after some time');
		}else{
			geodetails = {'Lat':my_pos.Lat,'Long':my_pos.Long,'onetime':'no'};
			socket.emit('send_loc',recv_username,geodetails);
		}
	}

	function get_loc() {
		if (navigator.geolocation) {
	        var optn = {
	            enableHighAccuracy : true,
	            timeout : 60000,
	            maximumAge : 0
	        };
	        var watchID = navigator.geolocation.watchPosition(suc, err, optn);
	    } else {
	        alert('Geolocation is not supported in your browser');
	    }
	}

	function suc(s) {
		my_pos = {'Lat':s.coords.latitude,'Long':s.coords.longitude};
	}

	function err(e) {
		alert('Error Getting Location.');
		if(watchID==null) {
			get_loc();
		}
	}

	function plot_loc(position) {
	    if(googleMap == null) {
	    	$('#mapdiv').css({
	    		margin: '0',
			    padding: '0',
			    width: '90vw',
			    float: 'left',
			    height: '78vh',
			    margin: '5vw'
	    	});
	        var mapOptions = {
	            zoom : 10,
	            mapTypeId : google.maps.MapTypeId.ROADMAP
	        };
	        var mapObj = document.getElementById('mapdiv');
	        googleMap = new google.maps.Map(mapObj, mapOptions);
	        directionsDisplay.setMap(googleMap);
	    }
	    if(jQuery.isEmptyObject(my_pos)) {
        	alert("Error in Plotting Location.");
        }else{
        	calcRoute(position);
        }
	}

	function calcRoute(pos) {
		$('#mapdiv').attr('class', 'my_visible');
		var request = {
			origin:{lat: my_pos.Lat, lng: my_pos.Long},
			destination:{lat: pos.Lat, lng: pos.Long},
			provideRouteAlternatives: true,
			travelMode: google.maps.DirectionsTravelMode.DRIVING,
			unitSystem: google.maps.UnitSystem.METRIC
		};
		directionsService.route(request, function(response, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
			}
		});
		calcDist(my_pos.Lat,my_pos.Long,pos.Lat,pos.Long);
	}

	function calcDist(lat1, lon1, lat2, lon2) {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);;
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		var kdist = dist * 1.609344;
		dist = Math.round(dist * 1000)/1000;
		kdist = Math.round(kdist * 1000)/1000;
		if($('#mapdist').hasClass('my-invisible')) {
			$('#mapdist').removeClass('my-invisible');
		}
		$('#km').text(kdist);
		$('#mile').text(dist);
	}

	$('#receivegeo').on('click', function(event) {
		socket.emit('req_loc',recv_username);
		$('#receivegeo').hide();
		$('#welcome2').text('Waiting for reply.');
	});

	$('#logout').on('click', function(event) {
		socket.emit('disconnect');
		my_username = null;
		recv_username = null;
		localStorage.removeItem("username");
		location.href = "/signin";
	});

	$('#groupchat').on('click', function() {
		if(recv_username != "")
			socket.emit('disconnect');
        location.href="/group";
    });

	socket.on('req_loc_ack', function(name) {
		var resp=confirm(name+" wants to know your location\nPress OK to allow and Cancel to deny");
		if(resp==true){
			send_loc();
			freq_send = setInterval(send_loc, 3000);
			$('#sendgeo').hide();
		}else{
			socket.emit('chat_message_loc',recv_username,'reciever Has Rejected Your Request');
		}
	});

	//Recieves messages
	socket.on('chat_message', function(sender,msg){
		console.log("Recieving: "+recv_username+" "+sender+" "+msg);
		$('#messages').append($('<li class="recv-msg">').html(sender+": "+msg));
	});

	socket.on('chat_message_loc', function(sender,msg) {
		console.log("Recieving: "+recv_username+" "+sender+" "+msg);
		$('#messages').append($('<li class="recv-msg">').html(sender+": "+msg));
		$('#welcome2').text('No Messages.');
		$('#receivegeo').show();
	});

	//If user leaves
	window.addEventListener("beforeunload", function (e) {
		do_when_disconnect();
		(e || window.event).returnValue = null;
		return null;
	});
	function do_when_disconnect(){
		socket.emit('disconnect');
	}


	//If reciever leaves
	socket.on('recv_quit',function(){
		alert("Your friend has left the chat");
		location.reload(true);
	});

	socket.on('receive_loc', function(sender,loc) {
		plot_loc(loc);
		if(loc.onetime == 'yes') {
			$('#messages').append($('<li class="recv-msg">').html(sender+" has sent you his location.<br>please scroll down to see it"));
		} else {
			if(first) {
				$('#welcome2').text('No Messages.');
				$('#messages').append($('<li class="recv-msg">').html(sender+" has sent you his location.<br>please scroll down to see it"));
				first = false;
			}
		}
	});

	socket.on('stop_req', function(sender) {
		if (freq_send) {
	        clearInterval(freq_send);
	        freq_send = null;
	        $('#messages').append($('<li class="recv-msg">').html(sender+" has sent stop request"));
	    }
	    $('#sendgeo').show();
	});

	socket.on('delete_user_ack', function() {
		alert("Please reload.");
		location.reload(true);
	});

	socket.on('allow_grp_access',function(name) {
		var reply=confirm(name+" wants to start a group conversation with you\nPress OK to allow and Cancel to deny");
		if(reply == true) {
			socket.emit('grant_grp_access','yes',my_username,name);
			$('#loader').show();
		}else{
			socket.emit('grant_grp_access','no',my_username,name);
		}
	});

	socket.on('starting_grp_act', function(name,people) {
		fin_grp[cnt] = name;
		cnt = cnt + 1;
		for(var usr in people) {
			if(people[usr] != my_username) {
				fin_grp[cnt] = people[usr];
				cnt = cnt + 1;
			}
		}
		uri = "/groupchat?+";
		for(var i = 0;i < cnt;i++) {
			uri = uri+fin_grp[i];
			if(i != cnt-1) {
				uri = uri+"+";
			}
		} 
		location.href = uri;
	});
});