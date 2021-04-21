let socialSignin = {
	init(){
		const _self = this;

		if( typeof window.socialSignin_config != 'undefined' ){
			if( !( 'fb' in window.socialSignin_config) ){
				console.log('FB config not defined');
				return;
			}else{
				this.loadScript('https://connect.facebook.net/en_US/sdk.js',function(){});
			}
		}else{
			return;
		}

		if( typeof window.socialSignin_config != 'undefined' ){
			if( !( 'google' in window.socialSignin_config) ){
				console.log('Google config not defined');
				return;
			}else{
				this.loadScript('https://apis.google.com/js/platform.js?onload=gstart',function(){});
			}
		}else{
			return;
		}
	},
	loadScript(src,c){
	  var s,
	      r,
	      t;
	  r = false;
	  s = document.createElement('script');
	  s.type = 'text/javascript';
	  s.src = src;
	  s.onload = s.onreadystatechange = function() {
	    //console.log( this.readyState ); //uncomment this line to see which ready states are called.
	    if ( !r && (!this.readyState || this.readyState == 'complete') )
	    {
	      r = true;
	      c;
	    }
	  };
	  t = document.getElementsByTagName('script')[0];
	  t.parentNode.insertBefore(s, t);
	},
	fbSigninInit(){
		const _self = this;

		document.querySelectorAll('.socialSignin[data-type="fb"]').forEach( function( item ) {
			item.addEventListener('click',function(){
				event.preventDefault();
				FB.login(_self.statusChangeCallback, {scope: 'email,public_profile', return_scopes: true});
			});
		});
	},
	socialLogin(data){
		const _self = this;

		let url = ''

		if( typeof window.socialSignin_config != 'undefined' ){
			if( data.type == 'fb' ){
				if( window.socialSignin_config.hasOwnProperty('fb') ){
					if( window.socialSignin_config.fb.hasOwnProperty('extend_data') ){
						Object.assign(data,window.socialSignin_config.fb.extend_data);
					}
					if( window.socialSignin_config.fb.hasOwnProperty('url') ){
						url = window.socialSignin_config.fb.url;
					}else{
						if( typeof window.socialSignin_config != 'undefined' ){
							if( window.socialSignin_config.hasOwnProperty('console') && window.socialSignin_config.console == 1 ){
								console.log('Facebook url not defined');
							}
						}
						return;
					}
				}
			}else if(data.type === 'google'){
				if( window.socialSignin_config.hasOwnProperty('google') ){
					if( window.socialSignin_config.google.hasOwnProperty('extend_data') ){
						Object.assign(data,window.socialSignin_config.google.extend_data);
					}
					if( window.socialSignin_config.google.hasOwnProperty('url') ){
						url = window.socialSignin_config.google.url;
					}else{
						if( typeof window.socialSignin_config != 'undefined' ){
							if( window.socialSignin_config.hasOwnProperty('console') && window.socialSignin_config.console == 1 ){
								console.log('Google url not defined');
							}
						}
						return;
					}
				}
			}
		}

		var http = new XMLHttpRequest();
		let params = '';

		for (var key in data) {
		    if (data.hasOwnProperty(key)) {
		    	params+=key+'='+data[key]+'&';
		    }
		}

		params = params.split('&');

		params.pop()

		params = params.join('&');
        
        http.open('POST', url, true);
        
        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        
        http.onreadystatechange = function() {//Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {

                if( typeof window.socialSignin_config != 'undefined' ){
					if( data.type == 'fb' ){
						if( 'fb' in window.socialSignin_config ){
							if( 'result' in window.socialSignin_config.fb ){
								window[window.socialSignin_config.fb.result](http.responseText);
							}
						}
					}else if(data.type === 'google'){
						if( 'google' in window.socialSignin_config ){
							if( 'result' in window.socialSignin_config.google ){
								window[window.socialSignin_config.google.result](http.responseText);
							}
						}
					}
				}
            }else{
            	if( typeof window.socialSignin_config != 'undefined' ){
					if( ( 'console' in window.socialSignin_config ) && window.socialSignin_config.console == 1 ){
						console.log(http.responseText);
					}
				}
            }
        }
        http.send(params);
	},
	statusChangeCallback(response){

		const _self = this;

	    if (response.status === 'connected') {
	        FB.api('/me?fields=email,name,first_name,last_name',
		        function (response) {
		        	let data = {
		        		id : response.id,
		        		fullname : response.first_name+' '+response.last_name,
		        		first_name : response.first_name,
		        		last_name : response.last_name,
		        		email : response.email,
		        		avatar : 'http://graph.facebook.com/'+response.id+'/picture?type=square',
		        		type : 'fb'
		        	}
		            _self.socialLogin(data);
		        }
		    );
	    } else if (response.status === 'not_authorized') {
	        if( typeof window.socialSignin_config != 'undefined' ){
				if( ( 'console' in window.socialSignin_config ) && window.socialSignin_config.console == 1 ){
					console.log('Not authorized');
				}
			}
	    } else {
	        if( typeof window.socialSignin_config != 'undefined' ){
				if( ( 'console' in window.socialSignin_config ) && window.socialSignin_config.console == 1 ){
					console.log(response.status);
				}
			}
	    }
	},
	checkLoginState(){
		const _self = this;

	    FB.getLoginStatus(function (response) {
	    	_self.statusChangeCallback(response);
	    });
	}
}

socialSignin.init();

window.socialLogin = function(data){
	socialSignin.socialLogin(data);
}

window.checkLoginState = function(){
	socialSignin.checkLoginState();
}

window.googleUser = {}

// -- google
window.gstart = function(){
	var auth2;	
	gapi.load('auth2', function(){

	    // Retrieve the singleton for the GoogleAuth library and set up the client.
	    auth2 = gapi.auth2.init({
	        client_id: window.socialSignin_config.google.client_id,
	        cookiepolicy: 'single_host_origin'
	        // Request scopes in addition to 'profile' and 'email'
	        // scope: 'email'
	    });
	      
	    document.querySelectorAll('.socialSignin[data-type="google"]').forEach(function(item,index){
		    auth2.attachClickHandler(item, {},
		        function(googleUser) {

		        	let name = googleUser.getBasicProfile().getName().split(' ');
		            let data = {
		        		id : googleUser.getBasicProfile().getId(),
		        		fullname : googleUser.getBasicProfile().getName(),
		        		first_name : name[0],
		        		last_name : ( ( name.length > 1 ) ? name[1] : name[0] ),
		        		email : googleUser.getBasicProfile().getEmail(),
		        		type : 'google',
		        		avatar : ''
		        	}

		        	socialSignin.socialLogin(data);

		        }, function(error) {
					if( typeof window.socialSignin_config != 'undefined' ){
						if( ( 'console' in window.socialSignin_config ) && window.socialSignin_config.console == 1 ){
							console.log(JSON.stringify(error, undefined, 2));
						}
					}
	        	}
	        );
	    });
	    
	});
}
//--

window.fbAsyncInit = function () {
	let version = 'v4.0'
	if( typeof window.socialSignin_config != 'undefined' ){
		if( 'google' in window.socialSignin_config ){
			if( 'version' in window.socialSignin_config.fb ){
				version = window.socialSignin_config.fb.version;
			}
		}
	}
    FB.init({
      appId      : window.socialSignin_config.fb.client_id,
      cookie     : true,
      xfbml      : true,
      version    : version
    });

    socialSignin.fbSigninInit();
};



