const express = require('express');
const app = express();
const port = 3000; // or your preferred port

// Serve static files from 'public' directory
app.use(express.static('public'));

// Redirect root to homepage
app.get('/', (req, res) => {
  res.redirect('homepage.html'); // Adjust the path as needed
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
