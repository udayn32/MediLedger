<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $location = $_POST['location'];
    $email = $_POST['email'];
    $license = $_POST['license'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    $sql = "INSERT INTO manufacturers (name, location, email, license, password) VALUES ('$name', '$location', '$email', '$license', '$password')";

    if ($conn->query($sql) === TRUE) {
        echo "Registration successful";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    $conn->close();
}
?>

<form action="manufacturer_reg.php" method="post">
    Manufacturer Name: <input type="text" name="name" required><br>
    Manufacturer Location: <input type="text" name="location" required><br>
    Manufacturer Email: <input type="email" name="email" required><br>
    License: <input type="text" name="license" required><br>
    Create Password: <input type="password" name="password" required><br>
    <input type="submit" value="Register">
</form>
