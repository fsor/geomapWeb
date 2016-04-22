<?php
header('Access-Control-Allow-Origin: *');
$conn= mysqli_connect("mysqlsvr37.world4you.com", "sql7932275", "57zfz+a", "7932275db4");
 
// Check connection
if($conn === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}


$sql = "SELECT userID, pathID, pathColor, path FROM geomap";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {

$output = array(
    'userID' => $row["userID"],
    'pathID' => $row["pathID"],
    'pathColor' => $row["pathColor"],
    'path' => $row["path"]
);
echo json_encode($output);
    }
} else {
    echo "0 results";
}
$conn->close();
?> 