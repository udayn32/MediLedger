<?php
// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Database connection
$servername = "127.0.0.1"; 
$username = "root";        
$password = "";            
$dbname = "agriculture_blockchain"; // Ensure the database name is correct

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if the form was submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve and sanitize form inputs
    $name = $_POST['name'];
    $email = $_POST['email'];
    $location = $_POST['location'];
    $password = $_POST['password'];

    // Hash the password for security
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Prepare SQL query to insert data into the customer_details table
    $stmt = $conn->prepare("INSERT INTO customer_details (customer_name, customer_email, customer_loc, customer_pass) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $location, $hashed_password);

    // Execute query and check for success
    if ($stmt->execute()) {
        echo "<p style='color: green;'>New customer added successfully!</p>";
    } else {
        echo "<p style='color: red;'>Error: " . $stmt->error . "</p>";
    }

    // Close statement
    $stmt->close();
}

// Close connection
$conn->close();
?>
