<?php
header('Access-Control-Allow-Origin: *'); 
$link = mysqli_connect("mysqlsvr37.world4you.com", "sql7932275", "57zfz+a", "7932275db4");
 
// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

if(isset($_POST['userID'])) {
    $pathId = $_POST['pathID'];
    $userId = $_POST['userID'];
  } 



// sql to delete a record
$sql = "DELETE FROM geomap WHERE userID = '$userId' AND pathID = '$pathId'";

if ($link->query($sql) === TRUE) {
    echo "Record $userId - $pathId deleted successfully";
} else {
    echo "Error deleting record: " . $link->error;
}

mysqli_close($link);
?>
		