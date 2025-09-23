import React, { useState } from 'react';
import axios from 'axios';
import Toastify from 'toastify-js';
import { useNavigate } from 'react-router-dom';
import "toastify-js/src/toastify.css";
import '../style.css'; // Your existing CSS
import logo from '../Components/images/logo.png';
import baseUrl from '../baseUrl';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const showToast = (message, type = 'success') => {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: {
        background: type === 'success' ? "green" : "red",
      }
    }).showToast();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${baseUrl}/api/users/login`, {
        email,
        password
      });

      const data = res.data;

      if (!res.status === 200) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      sessionStorage.setItem('token', data.token);
      if (data.user) {
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      showToast(`Login successful. Welcome ${data.email || data.user?.email}`);

      // Redirect based on role
      setTimeout(() => {
        const role = data.role || data.user?.role;
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'instructor') {
          navigate('/instructor/dashboard');
        } else {
          navigate('/user/dashboard'); // Default dashboard for students/users
        }
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="login-box">
         <img src={logo} alt="Logo" className="login-logo" />
        <h3 style={{ color: 'white', marginBottom: '20px' }}>Login Account</h3>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <div className="input-field">
              <span className="icon">📧</span>
              <input
                type="email"
                placeholder="username@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-field">
              <span className="icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <span 
                className="eye" 
                onClick={togglePasswordVisibility}
                style={{ cursor: 'pointer' }}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="bottom-links">
            <a href="/register">Create New Account?</a>
            <a href="/forgot-password">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;