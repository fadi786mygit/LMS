import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../Components/Sidebar';
import Topbar from '../Components/Topbar';
import Toastify from 'toastify-js';
import '../style.css';
import baseUrl from '../baseUrl';

const ViewUser = () => {
  const { id } = useParams(); // from react-router
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      showToast("Unauthorized. Please login.");
      navigate("/login");
    } else {
      loadUserDetails();
    }
  }, []);

  const loadUserDetails = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/users/get-users/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error("Error fetching user data", err);
      showToast("Failed to load user details", "error");
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
    sessionStorage.removeItem("token");
    Toastify({
      text: "Logged out successfully",
      className: "toast-info",
      duration: 1500
    }).showToast();

    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="admin-container">
      <Sidebar logout={logout} />
      <main className="main">
        <Topbar />

        <section className="main-content">
          <h2 className='text-white'>User Details</h2>
          <div className="table-container">
            <table>
              <tbody>
                {user ? (
                  <>
                    <tr><td><strong>Full Name:</strong></td><td>{user.fullName}</td></tr>
                    <tr><td><strong>Username:</strong></td><td>{user.username || '-'}</td></tr>
                    <tr><td><strong>Email:</strong></td><td>{user.email}</td></tr>
                    <tr><td><strong>Role:</strong></td><td>{user.role}</td></tr>
                    <tr><td><strong>Status:</strong></td><td>{user.status || 'Unknown'}</td></tr>
                    <tr><td><strong>Verified:</strong></td><td>{user.isVerified ? 'Yes' : 'No'}</td></tr>
                    <tr><td><strong>Created At:</strong></td><td>{new Date(user.createdAt).toLocaleString()}</td></tr>
                    <tr><td><strong>Updated At:</strong></td><td>{new Date(user.updatedAt).toLocaleString()}</td></tr>
                  </>
                ) : (
                  <tr><td colSpan="2">Loading...</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <button className="btn text-white" onClick={() => navigate(-1)}>← Back</button>
        </section>
      </main>
    </div>
  );
};

export default ViewUser;
