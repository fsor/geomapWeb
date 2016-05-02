<?php
session_start();
?>
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
	<h3>Private Area</h3>
<?php
if (!isset($_SESSION['username'])) {
echo 'You are not logged. <a href="index.php">login</a>';
} else {
echo 'hello <b>'.$_SESSION['username'].'</b> you are logged in. <a href="logout.php">logout</a>';
}
?>
</div>
</body>
</html>