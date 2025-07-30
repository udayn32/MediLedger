<?php
// Database credentials
$servername = "localhost";
$username = "root";
$password = ""; // Replace with your MySQL password if needed
$dbname = "agriculture_blockchain"; // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
