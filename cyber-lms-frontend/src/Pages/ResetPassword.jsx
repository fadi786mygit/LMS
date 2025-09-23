import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style.css'
import logo from '../Components/images/logo.png'; // Adjust path as needed
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rulesMessage, setRulesMessage] = useState('');
  const [showRules, setShowRules] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract email from URL
  useEffect(() => {
    const emailParam = new URLSearchParams(location.search).get('email');
    if (!emailParam) {
      Toastify({
        text: 'Email is missing. Please go back and restart the process.',
        duration: 1500,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'red',
      }).showToast();
      navigate('/forgot-password');
    } else {
      setEmail(emailParam);
    }
  }, [location.search, navigate]);

  const regexRules = {
    length: /.{8,}/,
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    specialChar: /[^A-Za-z0-9]/,
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

  const validatePassword = (value) => {
    let message = '';
    let valid = true;

    if (!regexRules.length.test(value)) {
      message += '<li>At least 8 characters</li>';
      valid = false;
    }
    if (!regexRules.uppercase.test(value)) {
      message += '<li>One uppercase letter</li>';
      valid = false;
    }
    if (!regexRules.lowercase.test(value)) {
      message += '<li>One lowercase letter</li>';
      valid = false;
    }
    if (!regexRules.number.test(value)) {
      message += '<li>One number</li>';
      valid = false;
    }
    if (!regexRules.specialChar.test(value)) {
      message += '<li>One special character</li>';
      valid = false;
    }

    setShowRules(!valid);
    setRulesMessage(valid ? '' : `<p>Password must contain:</p><ul>${message}</ul>`);
    return valid;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Toastify({
        text: 'Passwords do not match.',
        duration: 1500,
        close: true,
        gravity: 'top',
        position: 'right',
        backgroundColor: 'red',
      }).showToast();
      return;
    }

    if (!validatePassword(password)) {
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Password reset successfully. You can now login.');
        navigate('/login');
      } else {
        showToast(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error.');
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2 className="welcome-text">Set New Password</h2>

        <form onSubmit={handleSubmit}>
          {/* Hidden email input */}
          <input type="hidden" name="email" value={email} />

          {/* Password input */}
          <div className="input-group">
            <div className="input-field">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </div>
          </div>

          {/* Confirm password input */}
          <div className="input-group">
            <div className="input-field">
              <span className="icon">🔒</span>
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password rules */}
          {showRules && (
            <div
              className="rules"
              dangerouslySetInnerHTML={{ __html: rulesMessage }}
            />
          )}

          <button type="submit" className="login-btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
