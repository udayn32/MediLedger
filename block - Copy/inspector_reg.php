<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $license = trim($_POST['license'] ?? '');
    $password = trim($_POST['password'] ?? '');

    // Debugging output
    echo "Name: " . htmlspecialchars($name) . "<br>";
    echo "Email: " . htmlspecialchars($email) . "<br>";
    echo "License: " . htmlspecialchars($license) . "<br>";
    echo "Password: " . htmlspecialchars($password) . "<br>";

    // Ensure all fields are filled out
    if (!empty($name) && !empty($email) && !empty($license) && !empty($password)) {
        // Check if email already exists
        $checkStmt = $conn->prepare("SELECT email FROM inspectors WHERE email = ?");
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            echo "<script>alert('Email is already registered. Please use a different email.'); window.location.href='inspector_reg.html';</script>";
        } else {
            // Hash the password for security
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);

            // Prepare the SQL query
            $stmt = $conn->prepare("INSERT INTO inspectors (name, email, license, password) VALUES (?, ?, ?, ?)");

            // Check if the query was prepared successfully
            if ($stmt === false) {
                die("Error preparing the SQL query: " . $conn->error);
            }

            // Bind parameters
            $stmt->bind_param("ssss", $name, $email, $license, $hashed_password);

            // Execute the query
            if ($stmt->execute()) {
                // Fetch the last inserted inspector ID
                $inspector_id = $conn->insert_id;
                echo "<script>
                        alert('Registration successful! Your Inspector ID is: " . $inspector_id . "');
                        window.location.href='inspector_login.php';
                      </script>";
            } else {
                echo "Query error: " . $stmt->error . "<br>";
                echo "<script>alert('Error: " . $stmt->error . "'); window.location.href='inspector_reg.html';</script>";
            }

            // Close the statement
            $stmt->close();
        }

        // Close the check statement
        $checkStmt->close();
    } else {
        echo "<script>alert('All fields are required.'); window.location.href='inspector_reg.html';</script>";
    }
}

// Close connection
$conn->close();
?>
