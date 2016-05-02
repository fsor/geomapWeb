<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"> 
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
		<title>Ajax login Demo</title>
		<link type="text/css" rel="stylesheet" href="style.css" />
		<script type="text/javascript" src="jquery.js"></script>
		<script type="text/javascript" src="functions.js"></script>
	</head>
	<body>
	<div class="login_form">
        <h3>Login</h3>
        <form method="POST">
        <label>Username</label>
        <input type="text" name="username" id="username" placeholder="your username" /><br />
        <label>Password</label>
        <input type="password" name="pasword" id="password" placeholder="your password" /><br />
        <input type="submit" id="submit_login" name="submit" class="inputbutton grey" value="Login" />
        <span class="login_loading"></span>
        <span class="errormess"></span>
        </form>
	</div>
	
	</body>
</html>