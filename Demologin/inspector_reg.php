<?php
include 'db.php';
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $license = $_POST['license'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    $sql = "INSERT INTO inspectors (name, email, license, password) VALUES ('$name', '$email', '$license', '$password')";

    if ($conn->query($sql) === TRUE) {
        echo "Registration successful";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}
?>

<form action="inspector_reg.php" method="post">
    Inspector Name: <input type="text" name="name" required><br>
    Inspector Email: <input type="email" name="email" required><br>
    Inspector License: <input type="text" name="license" required><br>
    Create Password: <input type="password" name="password" required><br>
    <input type="submit" value="Register">
</form>
