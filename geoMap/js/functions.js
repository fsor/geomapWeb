$(function() {

       
  $("#submit_login").click(function() {
    var username = $("input#username").val();
    var password = $("input#password").val();
      
	if (username == "") {
	   $('.errormess').html('Please Insert Your Username');	
       return false;
    }
	else if (password == "") {
	   $('.errormess').html('Please Insert Your Password');	
       return false;
    }
      else{
         $('.errormess').html('');	 
      }
	var dataString = 'username='+ username + '&password=' + password;
	$.ajax({
      type: "POST",
      url: 'http://www.ff-stlorenz.at/geomap/login/login.php',
      data: dataString,
	  dataType: "html",
      success: function(data) {
          console.log(data);
	  if ((data == 'Error: wrong password') || (data == 'Error: username not found')) {
	  $('.errormess').html('Wrong Login Data');
		} else {
            sessionStorage.setItem('geomap_user', username);
            
            $('.loggedin_form').html('You are logged in as User: '+data+' <span id="logout">Sing out</span>');
            $('.loggedin_form').show();
            $('.login_form').hide();
            $('#pathList li').remove();
            up206b.initialize(data);
             $('#logout').unbind().click(function(){
                 sessionStorage.clear();
                  $('.login_form').show();
                  $('.login_form input:not(#submit_login):not(#submit_register)').val('');
                  $('.loggedin_form, #pathList, .tabbable').hide();
                  
             });
		}
      },
      error: function(){
      console.log(data);
      }
     });
    return false;
	});
    
      $("#submit_register").click(function() {
        var username = $("input#username").val();
        var password = $("input#password").val();
        if (username == "") {
           $('.errormess').html('Please choose a username to register');	
           return false;
        }
        else if (password == "") {
           $('.errormess').html('Please choose a secure password to register');	
           return false;
        }	
          else{
              $('.errormess').html('');
              	var dataString = 'username='+ username + '&password=' + password;
                $.ajax({
                  type: "POST",
                  url: 'http://www.ff-stlorenz.at/geomap/login/register.php',
                  data: dataString,
                  dataType: "html",
                  success: function(data) {
                      console.log(data);
                      if(data == 1){
                          $('.errormess').html('Registration successful.');
                          
                        $('#submit_register').attr('disabled','true');
                        

                      }else{
                          //console.log(data);
                          $('.errormess').html('Username already exists.');
                      }
                  },
                  error: function(){
                  console.log(data);
                      //$('.errormess').html('Error: '+data);	
                  }
                 });
                return false;
          }
          
	});
});		