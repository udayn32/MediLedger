import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is installed with `npm install axios`
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './FarmerLogin.css'; // Optional: You can create a separate CSS file for styling

const FarmerLogin = () => {
    const [farmerId, setFarmerId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');

        // Basic validation
        if (!farmerId || !name || !password) {
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            // Replace '/api/farmer_login' with your actual login endpoint
            const response = await axios.post('/api/farmer_login', { farmerId, name, password });
            if (response.data.success) {
                // Navigate to the farmer dashboard or homepage
                navigate('/farmer_dashboard'); // Adjust the path as necessary
            } else {
                setMessage(response.data.message);
            }
        } catch (error) {
            setMessage("Error during login. Please try again.");
            console.error("Login error:", error);
        }
    };

    return (
        <div className="container">
            <div className="login-box">
                <img src="farm3.jpg" alt="Farmer" className="farmer-image" />
                <h1>Farmer Login</h1>
                {message && <div className="message">{message}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="textbox">
                        <label htmlFor="id">Farmer ID:</label>
                        <input
                            type="text"
                            name="id"
                            id="id"
                            placeholder="Enter your Farmer ID"
                            value={farmerId}
                            onChange={(e) => setFarmerId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="textbox">
                        <label htmlFor="name">Farmer Name:</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            placeholder="Enter your Farmer Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="textbox">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="checkbox">
                        <input type="checkbox" name="remember_me" id="remember_me" />
                        <label htmlFor="remember_me">Remember Me</label>
                    </div>
                    <input className="btn" type="submit" value="Login" />
                    <p>New User? <a href="/farmer_reg">Register here</a></p>
                    <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
                </form>
            </div>
        </div>
    );
};

export default FarmerLogin;
