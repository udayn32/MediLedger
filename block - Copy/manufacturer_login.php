<?php
// Include the database connection file
include 'db.php';

// Check if the form has been submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['login'])) {
        $manufacturer_id = trim($_POST['id'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (!empty($manufacturer_id) && !empty($name) && !empty($password)) {
            if ($stmt = $conn->prepare("SELECT manufacturer_id, name, password FROM manufacturers WHERE manufacturer_id = ? AND name = ?")) {
                $stmt->bind_param("ss", $manufacturer_id, $name);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    $stmt->bind_result($stored_id, $stored_name, $hashed_password);
                    $stmt->fetch();

                    if (password_verify($password, $hashed_password)) {
                        header("Location: manufacturer.html");
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
            if ($stmt = $conn->prepare("SELECT name FROM manufacturers WHERE email = ?")) {
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
    <title>Manufacturer Login</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css">
    <style>
        body {
            font-family: 'Open Sans', sans-serif;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: url('B2.jpg') no-repeat center center fixed;
            background-size: cover;
        }

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .login-box {
            background-color: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
            width: 400px;
            text-align: center;
            position: relative;
            animation: fadeIn 1s;
        }

        .login-form {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
        }

        .textbox {
            margin: 15px 0;
            width: 100%;
        }

        .textbox input {
            width: 100%;
            padding: 12px;
            margin: 15px 0;
            border: 1px solid #ddd;
            border-radius: 8px;
            transition: border-color 0.3s;
        }

        .textbox input:focus {
            border-color: #4CAF50;
            box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .btn {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 12px;
            cursor: pointer;
            width: 100%;
            border-radius: 8px;
            transition: background-color 0.3s;
        }

        .btn:hover {
            background-color: #3e8e41;
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
            background-color: rgba(0, 0, 0, 0.4);
            padding-top: 60px;
        }

        .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 30px;
            border-radius: 10px;
            width: 50%;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
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
            font-size: 16px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-box animate__animated animate__fadeIn">
            <h1 style="color: #4CAF50;">Manufacturer Login</h1>
            <?php if (isset($login_message)): ?>
                <div class="message"><?php echo $login_message; ?></div>
            <?php endif; ?>
            <form action="manufacturer_login.php" method="POST" class="login-form">
                <div class="textbox">
                    <input type="text" name="id" placeholder="Manufacturer ID" required>
                </div>
                <div class="textbox">
                    <input type="text" name="name" placeholder="Manufacturer Name" required>
                </div>
                <div class="textbox">
                    <input type="password" name="password" placeholder="Password" required>
                </div>
                <input class="btn" type="submit" name="login" value="Login">
                <p>New User? <a href="manufacturer_reg.html">Register here</a></p>
                <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
            </form>
        </div>
    </div>

    <div id="forgot-password-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn" id="close-modal">&times;</span>
            <h2>Reset Password</h2>
            <form action="manufacturer_login.php" method="POST">
                <input type="email" name="email" placeholder="Enter your email" required>
                <input class="btn" type="submit" name="reset_password" value="Send Reset Link">
            </form>
        </div>
    </div>

    <script>
        const modal = document.getElementById("forgot-password-modal");
        const link = document.getElementById("forgot-password-link");
        const closeModal = document.getElementById("close-modal");

        link.onclick = () => modal.style.display = "block";
        closeModal.onclick = () => modal.style.display = "none";
        window.onclick = (event) => {
            if (event.target == modal) modal.style.display = "none";
        };
    </script>
</body>
</html>
