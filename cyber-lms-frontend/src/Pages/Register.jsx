import React, { useState } from 'react';
import Toastify from 'toastify-js';
import { useNavigate } from 'react-router-dom';
import "toastify-js/src/toastify.css";
import '../style.css';
import logo from '../Components/images/logo.png';
import baseUrl from '../baseUrl';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    countryCode: '+1',
    phone: ''
  });

  const navigate = useNavigate();

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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, username, email, countryCode, phone } = formData;
    const fullPhone = `${countryCode}${phone}`;

    try {
      const res = await fetch(`${baseUrl}/api/users/request-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, username, email, phone: fullPhone })
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Verification code sent to email');
        setTimeout(() => {
          navigate(`/verify-code?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        showToast(data.message || 'Failed to register', 'error');
      }
    } catch (err) {
      showToast('Server error', 'error');
      console.error(err);
    }
  };

  return (
    <div
      className="container"
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <div
        className="login-box"
        style={{
          maxWidth: '300px',
          padding: '15px 20px',   // equal left/right padding
          borderRadius: '10px'
        }}
      >

        <img src={logo} alt="Logo" className="login-logo" style={{ width: '60px', marginBottom: '8px' }} />
        <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '16px' }}>Create Account</h3>

        <form id="register-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px' }}>Full Name</label>
            <div className="input-field">
              <span className="icon">🧑</span>
              <input
                type="text"
                id="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                required
                style={{ fontSize: '13px', padding: '6px' }}
              />
            </div>
          </div>

          {/* Username */}
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px' }}>Username</label>
            <div className="input-field">
              <span className="icon">👤</span>
              <input
                type="text"
                id="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ fontSize: '13px', padding: '6px' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px' }}>Email Address</label>
            <div className="input-field">
              <span className="icon">📧</span>
              <input
                type="email"
                id="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ fontSize: '13px', padding: '6px' }}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="input-group" style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px' }}>Phone Number</label>
            <div className="input-field">
              <span className="icon">📱</span>
              <select
                id="countryCode"
                required
                value={formData.countryCode}
                onChange={handleChange}
                style={{
                  marginRight: '4px',
                  backgroundColor: '#232323',
                  color: '#fff',
                  border: 'none',
                  fontSize: '12px',
                  padding: '5px'
                }}
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+92">🇵🇰 +92</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input
                type="tel"
                id="phone"
                placeholder="XXXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
                style={{ fontSize: '13px', padding: '6px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            style={{ padding: '6px', fontSize: '13px' }}
          >
            Send Verification Code
          </button>

          <div
            className="bottom-links"
            style={{ marginTop: '10px', fontSize: '13px' }}
          >
            <a href="/login">Already have an account?</a>
          </div>
                                
          <div
            className="bottom-links"
            style={{ marginTop: '10px', fontSize: '13px' }}
          >
            <a href="/become-instructor">Become an Instructor?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
