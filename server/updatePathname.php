<?php
header('Access-Control-Allow-Origin: *'); 
$link = mysqli_connect("mysqlsvr37.world4you.com", "sql7932275", "57zfz+a", "7932275db4");
 
// Check connection
if($link === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}

if(isset($_POST['pathID'])) {
    $pathId = $_POST['pathID'];
    $oldPathID = $_POST['oldPathID'];
  

    $sql = 'UPDATE geomap SET pathID = "'.$pathId.'" WHERE pathID = "'.$oldPathID.'"';
    //$sql = "INSERT INTO geomap (userID, pathID, pathColor) VALUES ('$userId', '$pathId', '$pathColor') ON DUPLICATE KEY UPDATE pathID='pathID'";

    if(mysqli_query($link, $sql)){
        echo "Records added successfully.";
    } else{
        echo "ERROR: Could not able to execute $sql. " . mysqli_error($link);
    }
} 
// close connection
mysqli_close($link);
?>
		