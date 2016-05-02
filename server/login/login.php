<?php
header('Access-Control-Allow-Origin: *'); 
    $pdo = mysqli_connect("mysqlsvr37.world4you.com", "sql7932275", "57zfz+a", "7932275db4");
    session_start();

    if (isset($_POST)) {
	$userID = $_POST['username'];
	$post_password = $_POST['password'];
}

    $sql = "SELECT * FROM geomap WHERE userID = '{$userID}' AND pass = '$post_password'";
    $data = $pdo->query($sql);


if(count($data->fetch_assoc()) != 0) {
     //echo 'found';
    $pwd = array();

     while ($row = $data->fetch_assoc()) {
        array_push($pwd, $row['pass']);
    }


    foreach($pwd as $val) {
        if ($val == $post_password) {
            $login =  $userID;
	} else{
            $login = 'Error: wrong password';
        }
    }
    
    if(isset($login)) {
       echo $login; 
    }
    
   

}
else{
     echo 'Error: username not found'; //not logged in
}






?>