// pages/farmerLogin.js
import { useState } from 'react';
import styles from '../styles/FarmerLogin.module.css'; // Import the CSS module for styles

const FarmerLogin = () => {
    const [farmerId, setFarmerId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from submitting normally

        // Basic validation
        if (!farmerId || !name || !password) {
            setLoginMessage('Please fill in all fields.');
            return;
        }

        // Simulate an API call for login (this should be implemented in your backend)
        const mockLoginData = {
            farmerId: 'test123',
            name: 'John Doe',
            password: 'password123', // Note: In a real app, passwords should not be hard-coded
        };

        if (farmerId === mockLoginData.farmerId && name === mockLoginData.name && password === mockLoginData.password) {
            // Redirect to farmer dashboard
            window.location.href = '/farmer'; // Change this URL as needed
        } else {
            setLoginMessage('Invalid Farmer ID, Name, or Password.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <img src="/photos/farm3.jpg" alt="Farmer Image" className={styles.farmerImage} />
                <h1>Farmer Login</h1>
                <div id="loginMessage" className={styles.message}>{loginMessage}</div>
                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className={styles.textbox}>
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
                    <div className={styles.textbox}>
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
                    <div className={styles.textbox}>
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
                    <div className={styles.checkbox}>
                        <input type="checkbox" name="remember_me" id="remember_me" />
                        <label htmlFor="remember_me">Remember Me</label>
                    </div>
                    <button className={styles.btn} type="submit">Login</button>
                    <p>New User? <a href="/farmer_reg.html">Register here</a></p>
                    <p><a href="#" id="forgot-password-link">Forgot Password?</a></p>
                </form>
            </div>
        </div>
    );
};

export default FarmerLogin;
