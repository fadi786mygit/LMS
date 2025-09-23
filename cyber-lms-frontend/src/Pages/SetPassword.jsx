import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style.css'
import logo from '../Components/images/logo.png'; // Adjust path as needed
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const SetPassword = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('User');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [rulesHtml, setRulesHtml] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Extract query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    const usernameParam = params.get('username');

    if (emailParam) setEmail(emailParam);
    if (usernameParam) setUsername(usernameParam);
  }, [location.search]);

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
    let valid = true;
    let message = '';

    if (!regexRules.length.test(value)) {
      message += '<li>At least 8 characters</li>';
      valid = false;
    }
    if (!regexRules.uppercase.test(value)) {
      message += '<li>At least one uppercase letter</li>';
      valid = false;
    }
    if (!regexRules.lowercase.test(value)) {
      message += '<li>At least one lowercase letter</li>';
      valid = false;
    }
    if (!regexRules.number.test(value)) {
      message += '<li>At least one number</li>';
      valid = false;
    }
    if (!regexRules.specialChar.test(value)) {
      message += '<li>At least one special character</li>';
      valid = false;
    }

    if (!valid) {
      setShowRules(true);
      setRulesHtml(`<ul>${message}</ul>`);
    } else {
      setShowRules(false);
      setRulesHtml('');
    }

    return valid;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    if (!validatePassword(password)) {
      showToast('Fix password issues before submitting.', 'error');
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/auth/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast('Account created! You can now login.');
        navigate('/login');
      } else {
        showToast(data.message || 'Failed to set password', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    }
  };

  return (
    <div className="container">
      <div className="login-box">
        <img src={logo} alt="Logo" className="login-logo" />
        <h2 className="welcome-text">Welcome, <span>{username}</span>!</h2>

        <form onSubmit={handleSubmit}>
          {/* Hidden email input */}
          <input type="hidden" value={email} />

          {/* Password input */}
          <div className="input-group">
            <div className="input-field">
              <span className="icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <span
                className="eye"
                onClick={() => setShowPassword((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {/* Confirm password input */}
          <div className="input-group">
            <div className="input-field">
              <span className="icon">🔒</span>
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span
                className="eye"
                onClick={() => setShowConfirm((prev) => !prev)}
                style={{ cursor: 'pointer' }}
              >
                {showConfirm ? '🙈' : '👁️'}
              </span>
            </div>
          </div>

          {/* Password Rules */}
          {showRules && (
            <div
              className="rules"
              dangerouslySetInnerHTML={{ __html: rulesHtml }}
            />
          )}

          <button type="submit" className="login-btn">
            Set Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;
