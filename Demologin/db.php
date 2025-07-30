<?php
$servername = "127.0.0.1"; // Use the correct server (localhost IP)
$username = "root";        // Assuming default username for MySQL
$password = "";            // Assuming no password for local MySQL
$dbname = "agriculture blockchain"; // Use the correct database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
