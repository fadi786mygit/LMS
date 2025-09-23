import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style.css';
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';

const AddUser = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'student',
    isVerified: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const headerStyle = {
    background: 'linear-gradient(90deg, #0d6efd 0%, #6f42c1 100%)',
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePassword = () => setShowPass((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/users/add-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        showToast('User added successfully!');
        navigate('/admin/user-management');
      } else {
        showToast('Error: ' + (data.message || 'Something went wrong.'), 'error');
      }
    } catch (error) {
      setLoading(false);
      showToast('Error: ' + error.message, 'error');
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
            <div className="card-header text-white" style={headerStyle}>
              <div className="d-flex align-items-center gap-3">
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 10,
                    background: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                  }}
                >
                  👤
                </div>
                <div>
                  <h4 className="mb-0 fw-bold">Add New User</h4>
                  <small className="text-white-50">Create a user account</small>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="fullName" className="form-label fw-semibold">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      className="form-control form-control-lg shadow-sm"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="username" className="form-label fw-semibold">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-control form-control-lg shadow-sm"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="email" className="form-label fw-semibold">
                      Email address
                    </label>
                    <div className="input-group shadow-sm">
                      <span className="input-group-text" id="email-addon">
                        📧
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-control form-control-lg"
                        value={formData.email}
                        onChange={handleChange}
                        aria-describedby="email-addon"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="password" className="form-label fw-semibold">
                      Password
                    </label>
                    <div className="input-group shadow-sm">
                      <input
                        id="password"
                        name="password"
                        type={showPass ? 'text' : 'password'}
                        className="form-control form-control-lg"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePassword}
                        className="btn btn-outline-secondary"
                        aria-label="toggle password visibility"
                      >
                        {showPass ? '🙈' : '👁️'}
                      </button>
                    </div>
                    <div className="form-text">Minimum 6 characters recommended.</div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="role" className="form-label fw-semibold">
                      Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      className="form-select form-select-lg shadow-sm"
                      value={formData.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="col-12 d-flex align-items-center justify-content-between">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isVerified"
                        name="isVerified"
                        checked={formData.isVerified}
                        onChange={handleChange}
                      />
                      <label htmlFor="isVerified" className="form-check-label ms-2">
                        Is Verified
                      </label>
                    </div>

                    <div className="text-muted small">
                      All required fields will be validated.
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-grow-1"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <p className="text-center text-muted mt-3 small">
            Pro tip: choose the correct role before saving the account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddUser;
