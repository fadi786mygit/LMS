import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Toastify from 'toastify-js';
import baseUrl from '../baseUrl';


const ViewInstructor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showToast("Unauthorized. Please login.", "error");
      navigate("/login");
    } else {
      fetchInstructor();
    }
  }, []);

  const fetchInstructor = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setInstructor(data);
    } catch (err) {
      console.error("Error fetching instructor data", err);
      showToast("Failed to load instructor details", "error");
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

  const logout = () => {
    localStorage.removeItem("token");
    Toastify({ text: "Logged out successfully", backgroundColor: "blue" }).showToast();
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <img src="/assets/logo.png" alt="Logo" className="logo" />
        <nav>
          <ul>
            <li onClick={() => navigate('/admin/dashboard')}><i className="fas fa-home"></i> Home</li>
            <li onClick={() => navigate('/admin/user-management')}><i className="fas fa-users"></i> User Management</li>
            <li className="active" onClick={() => navigate('/admin/instructor-management')}><i className="fas fa-chalkboard-teacher"></i> Instructor Management</li>
            <li><i className="fas fa-book"></i> Courses</li>
            <li><i className="fas fa-credit-card"></i> Payments</li>
            <li><i className="fas fa-chart-line"></i> Reports & Analytics</li>
            <li onClick={() => navigate('/admin/tools')}><i className="fas fa-user"></i> Tool Management</li>
            <li onClick={() => navigate('/admin/settings')}><i className="fas fa-cog"></i> Settings</li>
            <li onClick={logout}><i className="fas fa-sign-out-alt"></i> Log Out</li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <input type="text" placeholder="Search..." className="search-bar" />
          <div className="topbar-right">
            <i className="fas fa-bell"></i>
            <span className="admin-name">Admin</span>
            <img src="/assets/logo.png" alt="Admin" className="profile-img" />
          </div>
        </header>

        {/* Instructor Details Section */}
        <section className="main-content">
          <h2>Instructor Details</h2>
          <div className="table-container">
            <table>
              <tbody>
                {instructor ? (
                  <>
                    <tr><td><strong>Full Name:</strong></td><td>{instructor.fullName}</td></tr>
                    <tr><td><strong>Username:</strong></td><td>{instructor.username || '-'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>{instructor.email}</td></tr>
                    <tr><td><strong>Role:</strong></td><td>{instructor.role}</td></tr>
                    <tr><td><strong>Status:</strong></td><td>{instructor.status || 'Unknown'}</td></tr>
                    <tr><td><strong>Verified:</strong></td><td>{instructor.isVerified ? 'Yes' : 'No'}</td></tr>
                    <tr><td><strong>Created At:</strong></td><td>{new Date(instructor.createdAt).toLocaleString()}</td></tr>
                    <tr><td><strong>Updated At:</strong></td><td>{new Date(instructor.updatedAt).toLocaleString()}</td></tr>
                  </>
                ) : (
                  <tr><td colSpan="2">Loading...</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn" onClick={() => navigate(-1)}>← Back</button>
        </section>
      </main>
    </div>
  );
};

export default ViewInstructor;
