<?php
// customer_reg.php

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

// Check if the form data is received
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Validate and get POST data
    $name = isset($_POST['name']) ? $_POST['name'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $location = isset($_POST['location']) ? $_POST['location'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Ensure all fields are filled out
    if (!empty($name) && !empty($email) && !empty($location) && !empty($password)) {
        // Hash the password for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Prepare the SQL query
        $stmt = $conn->prepare("INSERT INTO customers (name, email, location, password) VALUES (?, ?, ?, ?)");

        // Check if the query was prepared successfully
        if ($stmt === false) {
            die("Error preparing the SQL query: " . $conn->error);
        }

        // Bind parameters
        $stmt->bind_param("ssss", $name, $email, $location, $hashed_password);

        // Execute the query
        if ($stmt->execute()) {
            // Fetch the last inserted customer ID
            $customer_id = $conn->insert_id;

            // Display success message with customer ID
            echo "<script>alert('Registration successful! Your Customer ID is: " . $customer_id . "'); window.location.href='customer_login.php';</script>";
        } else {
            echo "<script>alert('Error: " . $stmt->error . "'); window.location.href='customer_reg.html';</script>";
        }

        // Close the statement
        $stmt->close();
    } else {
        echo "<script>alert('All fields are required.'); window.location.href='customer_reg.html';</script>";
    }
}

// Close connection
$conn->close();
?>
