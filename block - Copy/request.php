<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Farmer Details</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
            padding: 20px;
            
        }
        .container {
            margin-top: 50px;
        }
        .table-container {
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 20px;
        }
        .table {
            margin-bottom: 0;
        }
        .header-text {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
            color: #343a40;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="table-container">
            <div class="header-text">Farmer Details</div>
            <?php
            // Database connection settings
            $servername = "localhost"; // Change to your server name
            $username = "root";        // Change to your database username
            $password = "";            // Change to your database password
            $dbname = "agriculture_blockchain";     // Change to your database name

            // Create connection
            $conn = new mysqli($servername, $username, $password, $dbname);

            // Check connection
            if ($conn->connect_error) {
                die("Connection failed: " . $conn->connect_error);
            }

            // SQL query to fetch farmer details
            $sql = "SELECT farmer_id, name, email, location, phone FROM farmers";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                echo '<table class="table table-striped">';
                echo '<thead class="thead-dark">';
                echo '<tr><th>ID</th><th>Name</th><th>Email</th><th>Location</th><th>Phone</th><th>Action</th></tr>';
                echo '</thead><tbody>';
                
                // Output data for each row
                while($row = $result->fetch_assoc()) {
                    echo '<tr>';
                    echo '<td>' . htmlspecialchars($row["farmer_id"]) . '</td>';
                    echo '<td>' . htmlspecialchars($row["name"]) . '</td>';
                    echo '<td>' . htmlspecialchars($row["email"]) . '</td>';
                    echo '<td>' . htmlspecialchars($row["location"]) . '</td>';
                    echo '<td>' . htmlspecialchars($row["phone"]) . '</td>';
                    echo '<td><a href="crops.html" class="btn btn-primary">View Crops</a></td>'; // Direct link to crops.php
                    echo '</tr>';
                }
                echo '</tbody></table>';
            } else {
                echo '<div class="alert alert-warning" role="alert">No farmer records found.</div>';
            }

            // Close connection
            $conn->close();
            ?>
        </div>
    </div>

    <!-- Bootstrap JS and dependencies -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@1.16.1/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
