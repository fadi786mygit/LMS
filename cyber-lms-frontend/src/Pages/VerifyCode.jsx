import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../Components/images/logo.png';
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';


const VerifyCode = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  // Get email from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userEmail = urlParams.get('email');
    if (userEmail) setEmail(userEmail);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${baseUrl}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Code verified!");
        navigate(`/set-password?email=${encodeURIComponent(data.email)}&username=${encodeURIComponent(data.username)}`);
      } else {
        showToast(data.message || "Verification failed", 'error');
      }
    } catch (err) {   
      console.error(err);
      showToast("Server error", 'error');
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

        <h3 style={{ color: 'white', marginBottom: '20px' }}>Email Verification</h3>

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
                placeholder="Enter 6-digit code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="login-btn">Verify Code</button>

          <div className="bottom-links">
            <span onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>Back</span>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyCode;
