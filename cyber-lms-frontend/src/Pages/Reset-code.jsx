import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../style.css'
import logo from '../Components/images/logo.png'; // Adjust path as needed
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';


const ResetCode = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromUrl = queryParams.get('email');
    setEmail(emailFromUrl || '');
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Code verified. You can now set a new password.');
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      } else {
        showToast(data.message || 'Invalid code.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error.', 'error');
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
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Verify Reset Code</h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-field">
              <span className="icon">📧</span>
              <input type="email" value={email} readOnly />
            </div>
          </div>

          <div className="input-group">
            <label>Verification Code</label>
            <div className="input-field">
              <span className="icon">🔢</span>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn">Verify Code</button>

          <div className="bottom-links">
            <a href="/login">Back to Login</a>
            <a href="/forgot-password">Resend Code</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetCode;
