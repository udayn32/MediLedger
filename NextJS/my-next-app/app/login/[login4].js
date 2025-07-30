// pages/login.js
import { useState } from 'react';
import styles from '../styles/Login.module.css'; // Create a CSS module for styles

const Login = () => {
    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPassword, setCustomerPassword] = useState('');
    const [loginMessage, setLoginMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        // Simulate login verification
        if (customerId === 'sampleID' && customerName === 'sampleName' && customerPassword === 'samplePassword') {
            window.location.href = '/customer'; // Redirect on successful login
        } else {
            setLoginMessage('Invalid credentials. Please try again.');
        }
    };

    const handleResetPassword = () => {
        if (resetEmail) {
            alert(`Password reset link has been sent to ${resetEmail}`);
            setShowModal(false);
        } else {
            alert('Please enter your email.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1>Customer Login</h1>
                <div className={styles.message}>{loginMessage}</div>
                <form onSubmit={handleSubmit}>
                    <div className={styles.textbox}>
                        <input
                            type="text"
                            placeholder="Customer ID"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.textbox}>
                        <input
                            type="text"
                            placeholder="Customer Name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.textbox}>
                        <input
                            type="password"
                            placeholder="Password"
                            value={customerPassword}
                            onChange={(e) => setCustomerPassword(e.target.value)}
                            required
                        />
                    </div>
                    <input className={styles.btn} type="submit" value="Login" />
                    <p>New User? <a href="/customer_reg.html">Register here</a></p>
                    <p>
                        <a href="#" onClick={() => setShowModal(true)}>Forgot Password?</a>
                    </p>
                </form>
            </div>

            {showModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <span className={styles.closeBtn} onClick={() => setShowModal(false)}>&times;</span>
                        <h2>Reset Password</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                        />
                        <input className={styles.btn} type="button" value="Send Reset Link" onClick={handleResetPassword} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
