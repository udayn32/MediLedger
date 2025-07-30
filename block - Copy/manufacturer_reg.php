<?php
// manufacturer_reg.php

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
    $location = isset($_POST['location']) ? $_POST['location'] : '';
    $email = isset($_POST['email']) ? $_POST['email'] : '';
    $license = isset($_POST['license']) ? $_POST['license'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';

    // Ensure all fields are filled out
    if (!empty($name) && !empty($location) && !empty($email) && !empty($license) && !empty($password)) {
        // Hash the password for security
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Prepare the SQL query
        $stmt = $conn->prepare("INSERT INTO manufacturers (name, location, email, license, password) VALUES (?, ?, ?, ?, ?)");

        // Check if the query was prepared successfully
        if ($stmt === false) {
            die("Error preparing the SQL query: " . $conn->error);
        }

        // Bind parameters
        $stmt->bind_param("sssss", $name, $location, $email, $license, $hashed_password);

        // Execute the query
        if ($stmt->execute()) {
            // Fetch the last inserted manufacturer ID
            $manufacturer_id = $conn->insert_id;

            // Display success message with manufacturer ID
            echo "<script>
                    alert('Registration successful! Your Manufacturer ID is: " . $manufacturer_id . "');
                    window.location.href='manufacturer_login.php';
                  </script>";
            exit(); // Stop further execution to prevent form reloading
        } else {
            echo "<script>alert('Error: " . $stmt->error . "'); window.location.href='manufacturer_reg.html';</script>";
        }

        // Close the statement
        $stmt->close();
    } else {
        echo "<script>alert('All fields are required.'); window.location.href='manufacturer_reg.html';</script>";
    }
}

// Close connection
$conn->close();
?>
