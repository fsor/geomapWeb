$(function() {
    
    
  $("#submit_login").click(function() {
	var username = $("input#username").val();
	if (username == "") {
	   $('.errormess').html('Please Insert Your Username');	
       return false;
    }
	var password = $("input#password").val();
	if (password == "") {
	   $('.errormess').html('Please Insert Your Password');	
       return false;
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
            
            $('.loggedin_form').html('Sie sind eingelogged als: '+data+' <span id="logout">abmelden</span>');
            $('.loggedin_form').show();
            $('.login_form').hide();
            $('#pathList li').remove();
            up206b.initialize(data);
             $('#logout').unbind().click(function(){
                 sessionStorage.clear();
                  $('.login_form').show();
                  $('.login_form input:not(#submit_login)').val('');
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
});		