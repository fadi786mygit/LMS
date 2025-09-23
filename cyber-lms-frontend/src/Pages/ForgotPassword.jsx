import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style.css'
import logo from '../Components/images/logo.png'; // Adjust path as needed
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/users/request-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Verification code sent to your email.');
        navigate(`/reset-code?email=${encodeURIComponent(email)}`);
      } else {
        showToast(data.message || 'Failed to send verification code.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error.');
    }
  };

   const showToast = (msg, type = 'success') => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === 'success' ? "green" : "red",
      }
    }).showToast();
  };

  return (
    <div className="container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Forgot Password</h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-field">
              <span className="icon">📧</span>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn">Send Verification Code</button>

          <div className="bottom-links">
            <a href="/login">Back to Login</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
