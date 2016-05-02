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
      url: 'login.php',
      data: dataString,
	  dataType: "html",
      success: function(data) {
console.log(data);
	  if (data == 'false') {
	  $('.errormess').html('Wrong Login Data');
		} else {
			$('.errormess').html(data);	
			//document.location.href = 'private.php';	
		}
      },
      error: function(){
      console.log(data);
      }
     });
    return false;
	});
});		