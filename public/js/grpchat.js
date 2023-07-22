$(window).load(function() {

	var directionsDisplay = new google.maps.DirectionsRenderer({
	  polylineOptions: {
	    strokeColor: "red"
	  }
	});

	var directionsService = new google.maps.DirectionsService();

	var freq_send = null, googleMap = null, googleMap1 = null, avail = {}, first = true, my_pos={}, watchID=null;

	var fin_grp = {}, cnt = 0;

	var master = '', others= {}, chat_closed = false;

	var my_username = '', recv_username = '', geodetails = '', socket = null, centralMeetingPlace = null;

	var mapMarkers = {}, bounds = new google.maps.LatLngBounds(), mapMarkerColor = {};

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
		mapMarkers[my_username] = {'lat':s.coords.latitude,'lng':s.coords.longitude}
		if(googleMap == null) {
	    	$('#mapdiv').css({
	    		margin: '5%',
			    padding: '0',
			    width: '90%',
			    float: 'left',
			    height: '78%'
	    	});
	        var mapOptions = {
	            zoom : 10,
	            mapTypeId : google.maps.MapTypeId.ROADMAP
	        };
	        var mapObj = document.getElementById('mapdiv');
	        googleMap = new google.maps.Map(mapObj, mapOptions);
	        directionsDisplay.setMap(googleMap);
	    }
	}

	function err(e) {
		alert('Error Getting Location.');
		if(watchID==null) {
			get_loc();
		}
	}

	if(localStorage.getItem("username") != null){
		socket = io.connect('https://buddytrack2.herokuapp.com', {'sync disconnect on unload': false });
	}else{
		alert("Please Login Again.");
		location.href="/signin";
	}

	// on connection to server
	socket.on('connect', function(){
		plat = localStorage.getItem("place_lat");
        plng = localStorage.getItem("place_lng");
        if (plat != null && plng != null) {
        	centralMeetingPlace = {}
        	centralMeetingPlace['lat'] = plat;
        	centralMeetingPlace['lng'] = plng;
        	mapMarkerColor['destination'] = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
        	mapMarkers['destination'] = {'lat':parseFloat(centralMeetingPlace['lat']),'lng':parseFloat(centralMeetingPlace['lng'])}
        }
		get_loc();
		createOthers();
		my_username = localStorage.getItem("username");
		mapMarkerColor[my_username] = "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
		socket.emit('update_user_group',my_username,others,centralMeetingPlace);
		setInterval(calcRoute,2000);
	});

	socket.on('update_user_group_reply',function(reply){
		if (reply) {
			start();
		}else{
			socket.emit('update_user_group',my_username,others,centralMeetingPlace);	
		}
	});

	socket.on('set_CMP',function(cmp){
		centralMeetingPlace = cmp;
		mapMarkerColor['destination'] = "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
		mapMarkers['destination'] = {'lat':parseFloat(centralMeetingPlace['lat']),'lng':parseFloat(centralMeetingPlace['lng'])}
	});

	function createOthers(){
		var uri = location.href;
		uri = uri.split('+');
		var len = uri.length;
		if(uri[1] == "master") {
			master = localStorage.getItem("username");;
			for (var i = 2 ; i < len ; i++) {
				others[i-2] = uri[i];
			}
		}else{
			master = uri[1];
			for (var i = 2 ; i < len ; i++) {
				others[i-2] = uri[i];
			}
			others[i-2] = master;
		}
	}

	function start() {
		$("#loader").fadeOut("slow");
		$('.welcome3').html("");
		$('.welcome3').append(my_username+'<br>');
		for (var usr in others) {
			$('.welcome3').append(avail[usr]+"<br>");
		}
		send_loc();
		freq_send = setInterval(send_loc, 5000);
	}

	$('#logout').on('click', function(event) {
		socket.emit('disconnect_grp',master,my_username);
		localStorage.removeItem("username");
		location.href = "/signin";
	});

	socket.on('update_user_det', function(left,avail) {
		$('.ctrl-msg').append(left+' has left.');
		$('.welcome3').html("");
		$('.welcome3').append(my_username+'<br>');
		others = {}, o_cnt = 0;
		for (var usr in avail) {
			if(avail[usr] != my_username)
				others[o_cnt++] = avail[usr];
			$('.welcome3').append(avail[usr]+"<br>");
		}
	});

	socket.on('closing_chat', function(user) {
		$('.ctrl-msg').append(user+' has left.');
		chat_closed = true;
		alert("Everybody has left the group.");
		location.href="/signin";
	});

	$('form').submit(function (e){
		e.preventDefault();
		var message = $('#m').val();
		if(message == '' || jQuery.trim(message).length == 0)
			return false;
		$('#m').val('');
		$('#messages').append($('<li class="sent-msg">').text(my_username+": "+message));
		socket.emit('grp_chat_message',master,my_username,others,message);
	});

	socket.on('incoming_grp_msg', function(sender,msg) {
		$('#messages').append($('<li class="recv-msg">').html(sender+": "+msg));
	});

	window.addEventListener("beforeunload", function (e) {
		socket.emit('disconnect_grp',master,my_username);
		(e || window.event).returnValue = null;
		return null;
	});

	function send_loc() {
		if(!jQuery.isEmptyObject(my_pos)) {

			geodetails = {'Lat':my_pos.Lat,'Long':my_pos.Long,'onetime':'no'};
			socket.emit('grp_send_loc',master,my_username,others,geodetails);
		}
	}
	

	function plot_loc() {
		if (googleMap1 == null) {
			$('#mapdiv1').css({
	    		margin: '5%',
			    padding: '0',
			    width: '90%',
			    float: 'left',
			    height: '78%'
	    	});
	        var mapOptions = {
	            zoom : 10,
	            mapTypeId : google.maps.MapTypeId.ROADMAP
	        };
	        var mapObj = document.getElementById('mapdiv1');
	        googleMap1 = new google.maps.Map(mapObj, mapOptions);
	        $('#mapdiv1').attr('class', 'my_visible');
		}

	    for(var usr in mapMarkers) {
	        var position = new google.maps.LatLng(mapMarkers[usr]['lat'], mapMarkers[usr]['lng']);
	        bounds.extend(position);
	        marker = new google.maps.Marker({
	            position: position,
	            map: googleMap1,
	            title: usr,
	            icon: mapMarkerColor[usr],
	            label: {
	                color: 'black',
	                fontWeight: 'bold',
	                text: usr,
	            },
	        });
	        googleMap1.fitBounds(bounds);
	    }
	}

	function calcRoute() {
		if (!jQuery.isEmptyObject(my_pos) && centralMeetingPlace != null) {
			$('#mapdiv').attr('class', 'my_visible');
			var request = {
				origin:{lat: my_pos.Lat, lng: my_pos.Long},
				destination:{lat: parseFloat(centralMeetingPlace['lat']), lng: parseFloat(centralMeetingPlace['lng'])},
				provideRouteAlternatives: true,
				travelMode: google.maps.DirectionsTravelMode.DRIVING,
				unitSystem: google.maps.UnitSystem.METRIC
			};
			directionsService.route(request, function(response, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					directionsDisplay.setDirections(response);
				}
			});
		}
	}

	socket.on('grp_receive_loc', function(sender,loc) {
		mapMarkers[sender] = {'lat':loc.Lat,'lng':loc.Long}
		mapMarkerColor[sender] = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
		plot_loc();
	});
});