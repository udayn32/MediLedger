<?php
include 'db.php';

$login_success = false; // Initialize variable to track login status

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['login'])) {
        $customer_id = trim($_POST['id'] ?? '');
        $name = trim($_POST['name'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (!empty($customer_id) && !empty($name) && !empty($password)) {
            if ($stmt = $conn->prepare("SELECT customer_id, name, password FROM customers WHERE customer_id = ? AND name = ?")) {
                $stmt->bind_param("ss", $customer_id, $name);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    $stmt->bind_result($stored_id, $stored_name, $hashed_password);
                    $stmt->fetch();

                    if (password_verify($password, $hashed_password)) {
                        $login_success = true; // Set to true on successful login
                        header("Location: customer.html"); // Redirect to index.html
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
        // Forgot password functionality
        $email = trim($_POST['email'] ?? '');

        if (!empty($email)) {
            if ($stmt = $conn->prepare("SELECT name FROM customers WHERE email = ?")) {
                $stmt->bind_param("s", $email);
                $stmt->execute();
                $stmt->store_result();

                if ($stmt->num_rows == 1) {
                    // Here you would typically send an email with a password reset link.
                    // For demo purposes, we'll just alert the user.
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
    <title>Customer Login</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: url('B.jpg') no-repeat center center fixed;
            background-size: cover;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .login-box {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            width: 300px;
            text-align: center;
            position: relative;
        }
        .textbox {
            margin: 10px 0;
        }
        .textbox input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        .btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px;
            cursor: pointer;
            width: 100%;
            border-radius: 5px;
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
            font-size: 16px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="login-box">
            <h1>Customer Login</h1>
            <?php if (isset($login_message)): ?>
                <div class="message"><?php echo $login_message; ?></div>
            <?php endif; ?>
            <form action="customer_login.php" method="POST">
                <div class="textbox">
                    <input type="text" name="id" placeholder="Customer ID" required>
                </div>
                <div class="textbox">
                    <input type="text" name="name" placeholder="Customer Name" required>
                </div>
                <div class="textbox">
                    <input type="password" name="password" placeholder="Password" required>
                </div>
                <input class="btn" type="submit" name="login" value="Login">
                <p>New User? <a href="customer_reg.html" id="register-link">Register here</a></p>
                <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
            </form>
        </div>
    </div>

    <!-- Forgot Password Modal -->
    <div id="forgot-password-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn" id="close-modal">&times;</span>
            <h2>Reset Password</h2>
            <form action="customer_login.php" method="POST">
                <input type="email" name="email" placeholder="Enter your email" required>
                <input class="btn" type="submit" name="reset_password" value="Send Reset Link">
            </form>
        </div>
    </div>

    <script>
        // Open forgot password modal
        document.getElementById('forgot-password-link').addEventListener('click', function(event) {
            event.preventDefault();
            document.getElementById('forgot-password-modal').style.display = 'block';
        });

        // Close forgot password modal
        document.getElementById('close-modal').addEventListener('click', function() {
            document.getElementById('forgot-password-modal').style.display = 'none';
        });

        // Close modal if clicking outside of it
        window.addEventListener('click', function(event) {
            if (event.target === document.getElementById('forgot-password-modal')) {
                document.getElementById('forgot-password-modal').style.display = 'none';
            }
        });
    </script>
</body>
</html>
