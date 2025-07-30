<?php
include 'db.php';

$login_success = false; // Initialize variable to track login status

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['login'])) {
        $farmer_id = trim($_POST['id'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (!empty($farmer_id) && !empty($name) && !empty($password)) {
            if ($stmt = $conn->prepare("SELECT farmer_id, name, password FROM farmers WHERE farmer_id = ? AND name = ?")) {
                $stmt->bind_param("ss", $farmer_id, $name);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    $stmt->bind_result($stored_id, $stored_name, $hashed_password);
                    $stmt->fetch();

                    if (password_verify($password, $hashed_password)) {
                        $login_success = true;
                        header("Location: farmer.html");
                        exit();
                    } else {
                        $login_message = "Invalid password";
                    }
                } else {
                    $login_message = "No user found with this ID and Name";
                }

                $stmt->close();
            } else {
                $login_message = "Error preparing the SQL query: " . $conn->error;
            }
        } else {
            $login_message = "Please fill in all fields.";
        }
    } elseif (isset($_POST['reset_password'])) {
        $email = trim($_POST['email'] ?? '');

        if (!empty($email)) {
            if ($stmt = $conn->prepare("SELECT name FROM farmers WHERE email = ?")) {
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    $login_message = 'Password reset link has been sent to your email.';
                } else {
                    $login_message = 'No user found with this email';
                }

                $stmt->close();
            } else {
                $login_message = 'Error preparing the SQL query: ' . $conn->error;
            }
        } else {
            $login_message = 'Please enter your email.';
         }
    }

    $conn->close();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Farmer Login</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: url('farm1.jpg') no-repeat center center fixed;
            background-size: cover;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .login-box {
            background-color: white;
            padding: 50px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            width: 500px;
            text-align: center;
            position: relative;
            animation: fadeIn 1s;
        }
        .farmer-image {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            margin: 20px auto;
        }
        .textbox {
            margin: 20px 0;
        }
        .textbox label {
            display: block;
            margin-bottom: 10px;
            font-size: 18px;
        }
        .textbox input {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 18px;
        }
        .checkbox {
            margin: 20px 0;
        }
        .checkbox input {
            margin-right: 10px;
        }
        .checkbox label {
            font-size: 18px;
        }
        .btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 15px;
            cursor: pointer;
            width: 100%;
            border-radius: 5px;
            font-size: 18px;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0,0,0);
            background-color: rgba(0,0,0,0.4);
            padding-top: 60px;
        }
        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
        }
        .close-btn {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
        }
        .close-btn:hover,
        .close-btn:focus {
            color: black;
            text-decoration: none;
            cursor: pointer;
        }
        .message {
            color: red;
            font-size: 18px;
            margin-top: 20px;
        }
        @keyframes fadeIn {
            0% {
                opacity: 0;
            }
            100% {
                opacity: 1;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-box">
            <img src="farm3.jpg" alt="Farmer Image" class="farmer-image">
            <h1>Farmer Login</h1>
            <?php if (isset($login_message)): ?>
                <div class="message"><?php echo $login_message; ?></div>
            <?php endif; ?>
            <form action="farmer_login.php" method="POST">
                <div class="textbox">
                    <label for="id">Farmer ID:</label>
                    <input type="text" name="id" id="id" placeholder="Enter your Farmer ID" required>
                </div>
                <div class="textbox">
                    <label for="name">Farmer Name:</label>
                    <input type="text" name="name" id="name" placeholder="Enter your Farmer Name" required>
                </div>
                <div class="textbox">
                    <label for="password">Password:</label>
                    <input type="password" name="password" id="password" placeholder="Enter your password" required>
                </div >
                <div class="checkbox">
                    <input type="checkbox" name="remember_me" id="remember_me">
                    <label for="remember_me">Remember Me</label>
                </div>
                <input class="btn" type="submit" name="login" value="Login">
                <p>New User? <a href="farmer_reg.html" id="register-link">Register here</a></p>
                <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
            </form>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js"></script>
</body>
</html>